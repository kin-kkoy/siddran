import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// THE SOLE PURPOSE OF THIS PLUGIN IS FOR LINKS (WHEN CLICKED) TO OPEN IN A NEW TAB

function LinkClickPlugin({ isReadMode }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!isReadMode) return;

    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.href) {
        e.preventDefault();
        window.open(link.href, '_blank', 'noopener,noreferrer');
      }
    };

    rootElement.addEventListener('click', handleClick);
    return () => rootElement.removeEventListener('click', handleClick);
  }, [editor, isReadMode]);

  return null;
}

export default LinkClickPlugin;
