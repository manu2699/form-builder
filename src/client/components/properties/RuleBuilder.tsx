import { useState } from 'react';

import { Plus, Trash2, ChevronDown, Layers, X, Edit2, Check } from 'lucide-react';

import {
    type VisibilityRule,
    type RuleCondition,
    type RuleGroup,
    type RuleOperator,
    type RuleAction,
    isRuleGroup,
    createEmptyRule,
    createEmptyCondition,
    createEmptyGroup,
    OPERATOR_LABELS,
    VALUE_LESS_OPERATORS,
} from '@/client/lib/visibilityRules';

interface FormElement {
    id: string;
    type: string;
    label: string;
    visibilityRules?: VisibilityRule[];
    [key: string]: unknown;
}

interface RuleBuilderProps {
    element: FormElement;
    allElements: FormElement[];
    onUpdate: (key: string, value: unknown) => void;
}

const ConditionPopup = ({
    condition,
    availableFields,
    onSave,
    onCancel,
}: {
    condition: RuleCondition;
    availableFields: FormElement[];
    onSave: (condition: RuleCondition) => void;
    onCancel: () => void;
}) => {
    const [draft, setDraft] = useState<RuleCondition>({ ...condition });
    const needsValue = !VALUE_LESS_OPERATORS.includes(draft.operator);

    return (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 space-y-3">
            {/* Field selector */}
            <div>
                <label className="block text-xs text-gray-500 mb-1">Field</label>
                <select
                    value={draft.fieldId}
                    onChange={(e) => setDraft({ ...draft, fieldId: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 bg-white rounded"
                >
                    <option value="">Select field...</option>
                    {availableFields.map((field) => (
                        <option key={field.id} value={field.id}>
                            {field.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Operator selector */}
            <div>
                <label className="block text-xs text-gray-500 mb-1">Operator</label>
                <select
                    value={draft.operator}
                    onChange={(e) => setDraft({ ...draft, operator: e.target.value as RuleOperator })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 bg-white rounded"
                >
                    {Object.entries(OPERATOR_LABELS).map(([op, label]) => (
                        <option key={op} value={op}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Value input */}
            {needsValue && (
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Value</label>
                    <input
                        type="text"
                        value={draft.value ?? ''}
                        onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                        placeholder="Enter value..."
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
                    />
                </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
                <button
                    onClick={() => onSave(draft)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-black text-white hover:bg-gray-800 rounded"
                >
                    <Check size={14} />
                    Save
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-100 rounded"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

// Compact condition display
const ConditionItem = ({
    condition,
    index,
    availableFields,
    onChange,
    onRemove,
}: {
    condition: RuleCondition;
    index: number;
    availableFields: FormElement[];
    onChange: (condition: RuleCondition) => void;
    onRemove: () => void;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const field = availableFields.find((f) => f.id === condition.fieldId);
    const operatorLabel = OPERATOR_LABELS[condition.operator] || condition.operator;
    const needsValue = !VALUE_LESS_OPERATORS.includes(condition.operator);

    const getSummary = () => {
        if (!field) return 'Click to configure';
        let summary = `${field.label} ${operatorLabel}`;
        if (needsValue && condition.value) {
            summary += ` "${condition.value}"`;
        }
        return summary;
    };

    return (
        <div>
            <div
                className={`flex items-center gap-2 px-2 py-1.5 border text-sm cursor-pointer transition-colors rounded ${isEditing ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                onClick={() => setIsEditing(true)}
            >
                <span className="text-xs text-gray-400 font-mono shrink-0">#{index + 1}</span>
                <span className="flex-1 truncate text-gray-700 text-xs">
                    {getSummary()}
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 shrink-0"
                >
                    <Edit2 size={12} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 shrink-0"
                >
                    <Trash2 size={12} />
                </button>
            </div>

            {isEditing && (
                <ConditionPopup
                    condition={condition}
                    availableFields={availableFields}
                    onSave={(c) => {
                        onChange(c);
                        setIsEditing(false);
                    }}
                    onCancel={() => setIsEditing(false)}
                />
            )}
        </div>
    );
};

// Compact group display
const GroupItem = ({
    group,
    index,
    availableFields,
    onChange,
    onRemove,
    depth = 0,
}: {
    group: RuleGroup;
    index?: number;
    availableFields: FormElement[];
    onChange: (group: RuleGroup) => void;
    onRemove?: () => void;
    depth?: number;
}) => {
    const [conditionIndex, setConditionIndex] = useState(1);

    const updateCondition = (idx: number, item: RuleCondition | RuleGroup) => {
        const newConditions = [...group.conditions];
        newConditions[idx] = item;
        onChange({ ...group, conditions: newConditions });
    };

    const removeCondition = (idx: number) => {
        const newConditions = group.conditions.filter((_, i) => i !== idx);
        onChange({ ...group, conditions: newConditions });
    };

    const addCondition = () => {
        onChange({
            ...group,
            conditions: [...group.conditions, createEmptyCondition()],
        });
    };

    const addNestedGroup = () => {
        onChange({
            ...group,
            conditions: [...group.conditions, createEmptyGroup()],
        });
    };

    const toggleCombinator = () => {
        onChange({
            ...group,
            combinator: group.combinator === 'and' ? 'or' : 'and',
        });
    };

    return (
        <div className={`space-y-2 ${depth > 0 ? 'ml-3 pl-3 border-l-2 border-gray-200' : ''}`}>
            {/* Combinator badge */}
            {group.conditions.length > 1 && (
                <button
                    onClick={toggleCombinator}
                    className={`text-xs font-medium px-2 py-0.5 rounded ${group.combinator === 'and'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                        }`}
                >
                    {group.combinator.toUpperCase()}
                </button>
            )}

            {/* Conditions list */}
            <div className="space-y-1">
                {group.conditions.map((item, idx) => (
                    <div key={idx}>
                        {isRuleGroup(item) ? (
                            <div className="border border-gray-200 p-2 bg-gray-50/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-500 font-medium">Nested Group</span>
                                    <button
                                        onClick={() => removeCondition(idx)}
                                        className="text-xs text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <GroupItem
                                    group={item}
                                    availableFields={availableFields}
                                    onChange={(g) => updateCondition(idx, g)}
                                    depth={depth + 1}
                                />
                            </div>
                        ) : (
                            <ConditionItem
                                condition={item}
                                index={idx}
                                availableFields={availableFields}
                                onChange={(c) => updateCondition(idx, c)}
                                onRemove={() => removeCondition(idx)}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Add buttons */}
            <div className="flex gap-2">
                <button
                    onClick={addCondition}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-black px-2 py-1 border border-dashed border-gray-300 hover:border-gray-400"
                >
                    <Plus size={12} />
                    Condition
                </button>
                {depth < 1 && (
                    <button
                        onClick={addNestedGroup}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-black px-2 py-1 border border-dashed border-gray-300 hover:border-gray-400"
                    >
                        <Layers size={12} />
                        Group
                    </button>
                )}
            </div>
        </div>
    );
};

// Single rule editor
const RuleEditor = ({
    rule,
    ruleIndex,
    availableFields,
    onChange,
    onRemove,
}: {
    rule: VisibilityRule;
    ruleIndex: number;
    availableFields: FormElement[];
    onChange: (rule: VisibilityRule) => void;
    onRemove: () => void;
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const conditionCount = countConditions(rule.conditions);

    return (
        <div className="border border-gray-200 bg-white">
            {/* Rule header */}
            <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-200">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-0.5 text-gray-400 hover:text-gray-600"
                >
                    <ChevronDown
                        size={14}
                        className={`transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                    />
                </button>

                {/* Action selector */}
                <select
                    value={rule.action}
                    onChange={(e) => onChange({ ...rule, action: e.target.value as RuleAction })}
                    className="px-2 py-1 text-xs border border-gray-200 bg-white font-medium"
                >
                    <option value="show">Show when</option>
                    <option value="hide">Hide when</option>
                    <option value="enable">Enable when</option>
                    <option value="disable">Disable when</option>
                </select>

                <span className="text-xs text-gray-400 ml-auto">
                    {conditionCount} {conditionCount === 1 ? 'condition' : 'conditions'}
                </span>

                {/* Remove rule */}
                <button
                    onClick={onRemove}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Remove rule"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Rule conditions */}
            {isExpanded && (
                <div className="p-3 space-y-3">
                    <GroupItem
                        group={rule.conditions}
                        availableFields={availableFields}
                        onChange={(conditions) => onChange({ ...rule, conditions })}
                    />

                    {/* Active toggle at bottom */}
                    <div className="pt-2 border-t border-gray-100">
                        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rule.enabled}
                                onChange={(e) => onChange({ ...rule, enabled: e.target.checked })}
                                className="accent-black w-3.5 h-3.5"
                            />
                            Rule is active
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

// Count conditions helper
const countConditions = (group: RuleGroup): number => {
    return group.conditions.reduce((count, item) => {
        if (isRuleGroup(item)) {
            return count + countConditions(item);
        }
        return count + 1;
    }, 0);
};

// Main RuleBuilder component
export const RuleBuilder = ({ element, allElements, onUpdate }: RuleBuilderProps) => {
    const rules = element.visibilityRules ?? [];

    // Get all fields except current one for conditions
    const availableFields = allElements.filter((e) => e.id !== element.id && e.type !== 'button');

    const updateRules = (newRules: VisibilityRule[]) => {
        onUpdate('visibilityRules', newRules);
    };

    const addRule = () => {
        updateRules([...rules, createEmptyRule()]);
    };

    const updateRule = (index: number, rule: VisibilityRule) => {
        const newRules = [...rules];
        newRules[index] = rule;
        updateRules(newRules);
    };

    const removeRule = (index: number) => {
        updateRules(rules.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            {availableFields.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                    Add more fields to create visibility rules
                </p>
            ) : (
                <>
                    {/* Rules list */}
                    {rules.map((rule, index) => (
                        <RuleEditor
                            key={rule.id}
                            rule={rule}
                            ruleIndex={index}
                            availableFields={availableFields}
                            onChange={(r) => updateRule(index, r)}
                            onRemove={() => removeRule(index)}
                        />
                    ))}

                    {/* Add rule button */}
                    <button
                        onClick={addRule}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-black border border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                    >
                        <Plus size={16} />
                        Add Rule
                    </button>
                </>
            )}
        </div>
    );
};
