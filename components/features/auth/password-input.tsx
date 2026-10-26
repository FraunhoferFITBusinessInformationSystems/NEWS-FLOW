'use client';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { type ComponentProps, useState } from 'react';

import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from '@/components/ui/input-group';

/**
 * Password field with a button that shows or hides the entered password.
 * Accepts the props of an `<input>` except `type`, so it works with
 * react-hook-form's `register`.
 */
export function PasswordInput(props: Omit<ComponentProps<'input'>, 'type'>) {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<InputGroup>
			<InputGroupInput type={isVisible ? 'text' : 'password'} {...props} />
			<InputGroupAddon align="inline-end">
				<InputGroupButton
					size="icon-xs"
					aria-label={isVisible ? 'Passwort verbergen' : 'Passwort anzeigen'}
					aria-pressed={isVisible}
					onClick={() => setIsVisible((current) => !current)}
				>
					{isVisible ? <EyeOffIcon /> : <EyeIcon />}
				</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
	);
}
