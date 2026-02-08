import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Copy button area matches the CSS ::after pseudo-element position/size
const BTN_TOP = 8;
const BTN_HEIGHT = 24;
const BTN_RIGHT = 8;
const BTN_WIDTH = 56;

function CodeCopyPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const handleClick = (e) => {
      const codeBlock = e.target.closest('.editor-code');
      if (!codeBlock) return;

      // Check if click lands in the copy button area (top-right corner)
      const rect = codeBlock.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (
        y >= BTN_TOP &&
        y <= BTN_TOP + BTN_HEIGHT &&
        x >= rect.width - BTN_RIGHT - BTN_WIDTH &&
        x <= rect.width - BTN_RIGHT
      ) {
        e.preventDefault();
        e.stopPropagation();

        navigator.clipboard.writeText(codeBlock.textContent).then(() => {
          codeBlock.classList.add('editor-code-copied');
          setTimeout(() => codeBlock.classList.remove('editor-code-copied'), 1500);
        });
      }
    };

    rootElement.addEventListener('click', handleClick);
    return () => rootElement.removeEventListener('click', handleClick);
  }, [editor]);

  return null;
}

export default CodeCopyPlugin;
