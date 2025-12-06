interface KeyboardShortcutDisplayProps {
  keys: string[];
  isVisible: boolean;
}

const KeyboardShortcutDisplay = ({
  keys,
  isVisible,
}: KeyboardShortcutDisplayProps) => {
  if (!isVisible || keys.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex gap-1 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
        {keys.map((key, index) => (
          <kbd
            key={index}
            className="min-w-8 px-2 py-1 text-sm font-semibold text-center bg-muted border border-border rounded shadow-sm"
          >
            {key.toUpperCase()}
          </kbd>
        ))}
      </div>
    </div>
  );
};

export default KeyboardShortcutDisplay;
