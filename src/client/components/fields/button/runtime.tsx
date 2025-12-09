import type { RuntimeProps } from '@/client/components/fields/types';
import { Button } from '@/client/components/ui/Button';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

export const ButtonRuntime = ({
    label = 'Submit',
    buttonType = 'submit',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
}: RuntimeProps & {
    buttonType?: 'submit' | 'button' | 'reset';
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
}) => (
    <Button
        type={buttonType}
        variant={variant as ButtonVariant}
        size={size as ButtonSize}
        className={fullWidth ? 'w-full' : ''}
    >
        {label}
    </Button>
);
