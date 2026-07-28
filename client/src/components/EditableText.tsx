import { useState, useRef, useEffect } from 'react';

interface EditableTextProps {
    value: string;
    onSave: (newValue: string) => void;
    className?: string;
    isMultiline?: boolean;
    showButtons?: boolean;
}

export function EditableText({ value, onSave, className = '', isMultiline = false, showButtons = false }: EditableTextProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleDoubleClick = () => {
        setIsEditing(true);
        setEditValue(value);
    };

    const handleSave = () => {
        if (editValue !== value) {
            onSave(editValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                // Allow new line with shift+enter
                return;
            }
            if (!isMultiline) {
                handleSave();
            } else {
                handleSave();
            }
        } else if (e.key === 'Escape') {
            setEditValue(value);
            setIsEditing(false);
        }
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (showButtons) return; // Don't auto-save when buttons are shown
        if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
            handleSave();
        }
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
    };

    useEffect(() => {
        if (isEditing) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isEditing, editValue, value]);

    if (isEditing) {
        const InputComponent = isMultiline ? 'textarea' : 'input';
        return (
            <div className="relative">
                <InputComponent
                    ref={inputRef as any}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={className}
                    rows={isMultiline ? 3 : undefined}
                />
                {showButtons && (
                    <div className="absolute bottom-2 right-2 flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div onDoubleClick={handleDoubleClick} className={className}>
            {value}
        </div>
    );
}
