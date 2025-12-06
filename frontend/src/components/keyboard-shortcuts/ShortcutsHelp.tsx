import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { KeyboardShortcut } from '@/types/keyboard-shortcuts';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

const ShortcutsHelp = ({ isOpen, onClose, shortcuts }: ShortcutsHelpProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Navigate through the app using these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Navigation
            </h3>
            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{shortcut.label}</div>
                    {shortcut.description && (
                      <div className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <kbd
                        key={keyIndex}
                        className="min-w-8 px-2 py-1 text-sm font-semibold text-center bg-muted border border-border rounded shadow-sm"
                      >
                        {key.toUpperCase()}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              General
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                <div className="flex-1">
                  <div className="font-medium">Show shortcuts</div>
                  <div className="text-sm text-muted-foreground">
                    Open this help dialog
                  </div>
                </div>
                <div className="flex gap-1">
                  <kbd className="min-w-8 px-2 py-1 text-sm font-semibold text-center bg-muted border border-border rounded shadow-sm">
                    SHIFT
                  </kbd>
                  <kbd className="min-w-8 px-2 py-1 text-sm font-semibold text-center bg-muted border border-border rounded shadow-sm">
                    ?
                  </kbd>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                <div className="flex-1">
                  <div className="font-medium">Cancel key sequence</div>
                  <div className="text-sm text-muted-foreground">
                    Cancel the current key combination
                  </div>
                </div>
                <div className="flex gap-1">
                  <kbd className="min-w-8 px-2 py-1 text-sm font-semibold text-center bg-muted border border-border rounded shadow-sm">
                    ESC
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShortcutsHelp;
