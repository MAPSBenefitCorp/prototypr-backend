import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@strapi/design-system/Stack';
import { Box } from '@strapi/design-system/Box';
import { Field, FieldLabel, FieldHint, FieldError, FieldInput, FieldAction } from '@strapi/design-system/Field';
import { Typography } from '@strapi/design-system/Typography';
import MediaLib from '../MediaLib/index.js';
import Editor from '../Editor';
import { useIntl } from 'react-intl';
import {getSettings} from "../../../../utils/api";
import {defaultSettings} from "../../../../utils/defaults";
import { useQuery } from 'react-query';
import Earth from "@strapi/icons/Earth"
import Figure from "../extensions/Figure"
import Iframe from "../extensions/Iframe"
import Tweet from "../extensions/Tweet"
import Blockquote from "../extensions/Blockquote"
import Cite from "../extensions/Cite"
import Video from "../extensions/Video"
import Document from '@tiptap/extension-document'

// Editor
import {useEditor} from '@tiptap/react'
import {Extension, mergeAttributes, wrappingInputRule} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Text from '@tiptap/extension-text'
import UnderlineExtension from '@tiptap/extension-underline'
// import LinkExtension from '@tiptap/extension-link'
import LinkExtension from '../extensions/Link/Link'
// import ImageExtension from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Heading from '@tiptap/extension-heading'
import TextAlignExtension from '@tiptap/extension-text-align'
import TableExtension from '@tiptap/extension-table'
import TableRowExtension from '@tiptap/extension-table-row'
import TableCellExtension from '@tiptap/extension-table-cell'
import TableHeaderExtension from '@tiptap/extension-table-header'
import TextStyleExtension from '@tiptap/extension-text-style'
import CharacterCountExtension from '@tiptap/extension-character-count'
// import Blockquote from '@tiptap/extension-blockquote'
import { Color as ColorExtension } from '@tiptap/extension-color'


const Wysiwyg = ({ name, onChange, value, intlLabel, labelAction, disabled, error, description, required }) => {
  const {data: settings, isLoading} = useQuery('settings', getSettings)
  if (isLoading) return null

  //unwrap iframes from paragraphs
  // let startingVal = unWrapIframes(value)
  // startingVal = transformTweetTag(startingVal)

  return (
    <WysiwygContent
      name={name}
      onChange={onChange}
      value={value}
      intlLabel={intlLabel}
      labelAction={labelAction}
      disabled={disabled}
      error={error}
      description={description}
      required={required}
      settings={settings}
    />
  )
}

const CSSColumnsExtension = Extension.create({
  name: 'cssColumns',
  addOptions() {
    return {
      types: [],
      columnTypes: [2, 3],
      defaultColumnType: 'two',
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          cssColumns: {
            default: null,
            renderHTML: attributes => {
              if (attributes.cssColumns === null) return
              return {
                style: `column-count: ${attributes.cssColumns}`,
              }
            },
            parseHTML: element => element.style.columnCount || null,
          },
        },
      }
    ]
  },
  addCommands() {
    return {
      toggleColumns: (columnType) => ({commands, editor}) => {
        if (!editor.isActive({'cssColumns': columnType})) return this.options.types.every((type) => commands.updateAttributes(type, {cssColumns: columnType}))
        return this.options.types.every((type) => commands.resetAttributes(type, 'cssColumns'))
      },
      unsetColumns: (columnType) => ({commands}) => {
        return this.options.types.every((type) => commands.resetAttributes(type, 'cssColumns'))
      },
    }
  }
})


const WysiwygContent = ({ name, onChange, value, intlLabel, labelAction, disabled, error, description, required, settings }) => {
  const { formatMessage } = useIntl();
  const [ mergedSettings, setMergedSettings] = useState(null)


  const CustomParagraph = Paragraph.extend({
    addAttributes() {
      return {
        class: {
          default: null
        },
        background: {
          parseHTML:(element)=>{
            if(element.style.background){
              return element.style.background;
            }else{
              return element.style.backgroundColor
            }
          },
          renderHTML: (attributes) => {
            if(attributes.background){
              return {
                style: `background: ${attributes.background}`
              };
            }
          }
      },
        color: {
        parseHTML:(element)=>{
            return element.style.color;
        },
        renderHTML: (attributes) => {
          if(attributes.color){
            return {
              style: `color: ${attributes.color}`
            };
          }
        }
      },
      };
    },
    renderHTML({ node, HTMLAttributes }) {
      return [ 'p', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0 ]
    }
  });
  // const CustomHeading = Heading.extend({
  //   addAttributes() {
  //     return {
  //       class: {
  //         default: null
  //       }
  //     };
  //   },
  //   // renderHTML({ node, HTMLAttributes }) {
  //   //   console.log(node)
  //   //   return [ 'h2', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0 ]
  //   // }
  // });

  const editor = useEditor({
    extensions: [
      Document,
      Text,
      StarterKit.configure({
        gapcursor: true,
        paragraph:false,
        code: settings.code,
        codeBlock: settings.code,
        // blockquote: settings.blockquote,
        blockquote: false,
      }),
      Blockquote,
      Iframe,
      Tweet,
      Video,
      Cite,
      CustomParagraph,
      Heading,
      UnderlineExtension,
      TextAlignExtension.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyleExtension,
      settings.color ? ColorExtension : null,

      // Links
      settings.links.enabled ? LinkExtension.configure({
        autolink: settings.links.autolink,
        openOnClick: settings.links.openOnClick,
        linkOnPaste: settings.links.linkOnPaste,
        rel:'follow'
      }) : null,

      // Images
      settings.image.enabled ? Figure.configure({
        inline: settings.image.inline,
        allowBase64: settings.image.allowBase64,
      }) : null,


      // Table
      settings.table ? TableExtension.configure({
        allowTableNodeSelection: true,
      }) : null,
      settings.table ? TableRowExtension : null,
      settings.table ? TableCellExtension : null,
      settings.table ? TableHeaderExtension : null,

      settings.other && settings.other.wordcount ? CharacterCountExtension.configure() : null,

      // CSS Columns
      CSSColumnsExtension.configure({
        types: ['paragraph']
      }),
    ],
    content: value,
    onUpdate(ctx) {
      onChange({target: {name, value: ctx.editor.getHTML()}})
    },
  })

  if (editor === null) {
    return null
  }

  // Update content if value is changed outside (Mainly for i18n)
  if (editor !== null && editor.getHTML() !== value) {
    editor.commands.setContent(value)
  }

  return (
      <>
        <Stack spacing={1}>
          <Box>
            <FieldLabel action={labelAction} required={required}> {formatMessage(intlLabel)}</FieldLabel>
          </Box>
          <Editor
              key="editor"
              disabled={disabled}
              name={name}
              editor={editor}
              onChange={onChange}
              value={value}
              settings={settings}
          />
          {error &&
              <Typography variant="pi" textColor="danger600">
                {formatMessage({ id: error, defaultMessage: error })}
              </Typography>
          }
          {description &&
              <Typography variant="pi">
                {formatMessage(description)}
              </Typography>
          }
        </Stack>
      </>
  )
}

Wysiwyg.defaultProps = {
  description: '',
  disabled: false,
  error: undefined,
  intlLabel: '',
  required: false,
  value: '',
  settings: {}
};

Wysiwyg.propTypes = {
  description: PropTypes.shape({
    id: PropTypes.string,
    defaultMessage: PropTypes.string,
  }),
  disabled: PropTypes.bool,
  error: PropTypes.string,
  intlLabel: PropTypes.shape({
    id: PropTypes.string,
    defaultMessage: PropTypes.string,
  }),
  labelAction: PropTypes.object,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  value: PropTypes.string,
  settings: PropTypes.object
};

export default Wysiwyg;
