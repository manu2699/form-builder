import type { FieldProps } from '@/client/components/fields/types';
import { Button } from '@/client/components/ui/Button';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

export const ButtonPreview = ({
    label = 'Submit',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
}: FieldProps & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
}) => (
    <div className="pt-5"> {/* Align with input fields that have labels */}
        <Button
            variant={variant as ButtonVariant}
            size={size as ButtonSize}
            className={`pointer-events-none ${fullWidth ? 'w-full' : ''}`}
        >
            {label}
        </Button>
    </div>
);
