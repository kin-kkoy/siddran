import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertToMarkdownString } from '@lexical/markdown';
import { TRANSFORMERS } from '../utils/markdownTransformers';

function OnBlurPlugin({ onBlur }) {
  const [editor] = useLexicalComposerContext();
  const lastSavedContent = useRef('');

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const handleBlur = (event) => {
      // Don't save if focus moves to toolbar buttons
      const relatedTarget = event.relatedTarget;
      if (relatedTarget && relatedTarget.closest('[data-toolbar]')) {
        return;
      }

      editor.getEditorState().read(() => {
        const markdown = $convertToMarkdownString(TRANSFORMERS);
        // Only save if content has changed
        if (markdown !== lastSavedContent.current) {
          lastSavedContent.current = markdown;
          onBlur(markdown);
        }
      });
    };

    rootElement.addEventListener('blur', handleBlur);
    return () => rootElement.removeEventListener('blur', handleBlur);
  }, [editor, onBlur]);

  return null;
}

export default OnBlurPlugin;
