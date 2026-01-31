import { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from 'lexical';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingNode,
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $createCodeNode, $isCodeNode } from '@lexical/code';
import { $findMatchingParent, $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link';

import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaCode,
  FaLink,
  FaUndo,
  FaRedo,
  FaCheckSquare,
} from 'react-icons/fa';
import { LuHeading1, LuHeading2, LuHeading3, LuPilcrow } from 'react-icons/lu';

import styles from './ToolbarPlugin.module.css';

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Text format states
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));

      // Check for link
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));

      // Block type detection
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type === 'check' ? 'check' : type === 'number' ? 'ol' : 'ul');
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : $isCodeNode(element)
            ? 'code'
            : element.getType();
          setBlockType(type);
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, updateToolbar]);

  // Format handlers
  const formatBold = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  const formatItalic = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  const formatStrikethrough = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');

  const formatHeading = (headingTag) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType === headingTag) {
          // Toggle off - convert back to paragraph
          $setBlocksType(selection, () => {
            const { ParagraphNode, $createParagraphNode } = require('lexical');
            return $createParagraphNode();
          });
        } else {
          $setBlocksType(selection, () => $createHeadingNode(headingTag));
        }
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const { $createParagraphNode } = require('lexical');
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType === 'quote') {
          const { $createParagraphNode } = require('lexical');
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      }
    });
  };

  const formatCodeBlock = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType === 'code') {
          const { $createParagraphNode } = require('lexical');
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createCodeNode());
        }
      }
    });
  };

  const formatList = (listType) => {
    if (listType === 'ul') {
      if (blockType === 'ul') {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      }
    } else if (listType === 'ol') {
      if (blockType === 'ol') {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      }
    } else if (listType === 'check') {
      if (blockType === 'check') {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
      }
    }
  };

  const insertLink = () => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else {
      const url = prompt('Enter URL:');
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    }
  };

  const undo = () => editor.dispatchCommand(UNDO_COMMAND, undefined);
  const redo = () => editor.dispatchCommand(REDO_COMMAND, undefined);

  return (
    <div className={styles.toolbar} data-toolbar>
      {/* Undo/Redo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        className={styles.toolbarBtn}
        title="Undo (Ctrl+Z)"
      >
        <FaUndo />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className={styles.toolbarBtn}
        title="Redo (Ctrl+Y)"
      >
        <FaRedo />
      </button>

      <div className={styles.divider} />

      {/* Text formatting */}
      <button
        onClick={formatBold}
        className={`${styles.toolbarBtn} ${isBold ? styles.active : ''}`}
        title="Bold (Ctrl+B)"
      >
        <FaBold />
      </button>
      <button
        onClick={formatItalic}
        className={`${styles.toolbarBtn} ${isItalic ? styles.active : ''}`}
        title="Italic (Ctrl+I)"
      >
        <FaItalic />
      </button>
      <button
        onClick={formatStrikethrough}
        className={`${styles.toolbarBtn} ${isStrikethrough ? styles.active : ''}`}
        title="Strikethrough"
      >
        <FaStrikethrough />
      </button>

      <div className={styles.divider} />

      {/* Block types */}
      <button
        onClick={formatParagraph}
        className={`${styles.toolbarBtn} ${blockType === 'paragraph' ? styles.active : ''}`}
        title="Paragraph"
      >
        <LuPilcrow />
      </button>
      <button
        onClick={() => formatHeading('h1')}
        className={`${styles.toolbarBtn} ${blockType === 'h1' ? styles.active : ''}`}
        title="Heading 1"
      >
        <LuHeading1 />
      </button>
      <button
        onClick={() => formatHeading('h2')}
        className={`${styles.toolbarBtn} ${blockType === 'h2' ? styles.active : ''}`}
        title="Heading 2"
      >
        <LuHeading2 />
      </button>
      <button
        onClick={() => formatHeading('h3')}
        className={`${styles.toolbarBtn} ${blockType === 'h3' ? styles.active : ''}`}
        title="Heading 3"
      >
        <LuHeading3 />
      </button>

      <div className={styles.divider} />

      {/* Lists */}
      <button
        onClick={() => formatList('ul')}
        className={`${styles.toolbarBtn} ${blockType === 'ul' ? styles.active : ''}`}
        title="Bullet List"
      >
        <FaListUl />
      </button>
      <button
        onClick={() => formatList('ol')}
        className={`${styles.toolbarBtn} ${blockType === 'ol' ? styles.active : ''}`}
        title="Numbered List"
      >
        <FaListOl />
      </button>
      <button
        onClick={() => formatList('check')}
        className={`${styles.toolbarBtn} ${blockType === 'check' ? styles.active : ''}`}
        title="Checklist"
      >
        <FaCheckSquare />
      </button>

      <div className={styles.divider} />

      {/* Quote and Code */}
      <button
        onClick={formatQuote}
        className={`${styles.toolbarBtn} ${blockType === 'quote' ? styles.active : ''}`}
        title="Quote"
      >
        <FaQuoteRight />
      </button>
      <button
        onClick={formatCodeBlock}
        className={`${styles.toolbarBtn} ${blockType === 'code' ? styles.active : ''}`}
        title="Code Block"
      >
        <FaCode />
      </button>

      <div className={styles.divider} />

      {/* Link */}
      <button
        onClick={insertLink}
        className={`${styles.toolbarBtn} ${isLink ? styles.active : ''}`}
        title="Insert Link"
      >
        <FaLink />
      </button>
    </div>
  );
}

export default ToolbarPlugin;
