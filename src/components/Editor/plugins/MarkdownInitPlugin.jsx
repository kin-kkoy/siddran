import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertFromMarkdownString } from '@lexical/markdown';
import { $getRoot } from 'lexical';
import { TRANSFORMERS } from '../utils/markdownTransformers';

function MarkdownInitPlugin({ initialMarkdown }) {
  const [editor] = useLexicalComposerContext();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once per mount
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (initialMarkdown) {
      editor.update(() => {
        $convertFromMarkdownString(initialMarkdown, TRANSFORMERS);
      });
    }
  }, [editor, initialMarkdown]);

  return null;
}

export default MarkdownInitPlugin;
