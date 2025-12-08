// Visibility Rules - Types and Evaluation Engine

// Operators for comparing values
export type RuleOperator =
    | 'equals'
    | 'notEquals'
    | 'contains'
    | 'isEmpty'
    | 'isNotEmpty'
    | 'greaterThan'
    | 'lessThan';

// Single condition on a field
export interface RuleCondition {
    fieldId: string;
    operator: RuleOperator;
    value?: string | number;
}

// Group of conditions with AND/OR logic
export interface RuleGroup {
    combinator: 'and' | 'or';
    conditions: (RuleCondition | RuleGroup)[];
}

// Actions that can be taken
export type RuleAction = 'show' | 'hide' | 'enable' | 'disable';

// A complete visibility rule
export interface VisibilityRule {
    id: string;
    enabled: boolean;
    action: RuleAction;
    conditions: RuleGroup;
}

// Result of evaluating rules for an element
export interface RuleEvaluationResult {
    visible: boolean;
    enabled: boolean;
}

// Check if something is a RuleGroup (has combinator)
export function isRuleGroup(item: RuleCondition | RuleGroup): item is RuleGroup {
    return 'combinator' in item;
}

// Evaluate a single condition against form data
export function evaluateCondition(
    condition: RuleCondition,
    formData: Record<string, string>
): boolean {
    const fieldValue = formData[condition.fieldId] ?? '';
    const compareValue = condition.value ?? '';

    switch (condition.operator) {
        case 'equals':
            return fieldValue === String(compareValue);

        case 'notEquals':
            return fieldValue !== String(compareValue);

        case 'contains':
            return fieldValue.toLowerCase().includes(String(compareValue).toLowerCase());

        case 'isEmpty':
            return fieldValue.trim() === '';

        case 'isNotEmpty':
            return fieldValue.trim() !== '';

        case 'greaterThan':
            return Number(fieldValue) > Number(compareValue);

        case 'lessThan':
            return Number(fieldValue) < Number(compareValue);

        default:
            return true;
    }
}

// Evaluate a rule group (handles AND/OR and nesting)
export function evaluateRuleGroup(
    group: RuleGroup,
    formData: Record<string, string>
): boolean {
    if (group.conditions.length === 0) {
        return true; // Empty group is always true
    }

    const results = group.conditions.map(item => {
        if (isRuleGroup(item)) {
            return evaluateRuleGroup(item, formData);
        }
        return evaluateCondition(item, formData);
    });

    if (group.combinator === 'and') {
        return results.every(r => r);
    } else {
        return results.some(r => r);
    }
}

// Evaluate a single rule
export function evaluateRule(
    rule: VisibilityRule,
    formData: Record<string, string>
): boolean {
    if (!rule.enabled) {
        return true; // Disabled rules don't affect anything
    }
    return evaluateRuleGroup(rule.conditions, formData);
}

// Evaluate all rules for an element and determine visibility/enabled state
export function evaluateRulesForElement(
    rules: VisibilityRule[] | undefined,
    formData: Record<string, string>
): RuleEvaluationResult {
    // Default: visible and enabled
    const result: RuleEvaluationResult = {
        visible: true,
        enabled: true,
    };

    if (!rules || rules.length === 0) {
        return result;
    }

    for (const rule of rules) {
        if (!rule.enabled) continue;

        const conditionsMet = evaluateRuleGroup(rule.conditions, formData);

        switch (rule.action) {
            case 'show':
                if (!conditionsMet) result.visible = false;
                break;
            case 'hide':
                if (conditionsMet) result.visible = false;
                break;
            case 'enable':
                if (!conditionsMet) result.enabled = false;
                break;
            case 'disable':
                if (conditionsMet) result.enabled = false;
                break;
        }
    }

    return result;
}

// Create an empty rule
export function createEmptyRule(): VisibilityRule {
    return {
        id: Math.random().toString(36).substring(2, 9),
        enabled: true,
        action: 'show',
        conditions: {
            combinator: 'and',
            conditions: [],
        },
    };
}

// Create an empty condition
export function createEmptyCondition(): RuleCondition {
    return {
        fieldId: '',
        operator: 'equals',
        value: '',
    };
}

// Create an empty nested group
export function createEmptyGroup(): RuleGroup {
    return {
        combinator: 'and',
        conditions: [],
    };
}

// Operator labels for UI
export const OPERATOR_LABELS: Record<RuleOperator, string> = {
    equals: 'equals',
    notEquals: 'does not equal',
    contains: 'contains',
    isEmpty: 'is empty',
    isNotEmpty: 'is not empty',
    greaterThan: 'is greater than',
    lessThan: 'is less than',
};

// Operators that don't need a value
export const VALUE_LESS_OPERATORS: RuleOperator[] = ['isEmpty', 'isNotEmpty'];
