import { useRef, useState, type ChangeEvent } from 'react'
import './App.css'

type ColorRange = { start: number; end: number; color: string }
type StyleRange = { start: number; end: number }

type ExtraLine = {
  id: number
  text: string
  color: string
  bold: boolean
  italic: boolean
  colorRanges: ColorRange[]
  boldRanges: StyleRange[]
  italicRanges: StyleRange[]
}

type Translation = {
  id: number
  comment: string
  key: string
  title: string
  titleColor: string
  titleBold: boolean
  titleItalic: boolean
  titleColorRanges: ColorRange[]
  titleBoldRanges: StyleRange[]
  titleItalicRanges: StyleRange[]
  extraLines: ExtraLine[]
}

const colors = [
  { name: 'None', code: '' },
  { name: 'Black', code: '§0' },
  { name: 'Dark Blue', code: '§1' },
  { name: 'Dark Green', code: '§2' },
  { name: 'Dark Aqua', code: '§3' },
  { name: 'Dark Red', code: '§4' },
  { name: 'Dark Purple', code: '§5' },
  { name: 'Gold', code: '§6' },
  { name: 'Gray', code: '§7' },
  { name: 'Dark Gray', code: '§8' },
  { name: 'Blue', code: '§9' },
  { name: 'Green', code: '§a' },
  { name: 'Aqua', code: '§b' },
  { name: 'Red', code: '§c' },
  { name: 'Light Purple', code: '§d' },
  { name: 'Yellow', code: '§e' },
  { name: 'White', code: '§f' },
]

const colorHex: Record<string, string> = {
  '': '#eeeeee',
  '§0': '#000000',
  '§1': '#0000AA',
  '§2': '#00AA00',
  '§3': '#00AAAA',
  '§4': '#AA0000',
  '§5': '#AA00AA',
  '§6': '#FFAA00',
  '§7': '#AAAAAA',
  '§8': '#555555',
  '§9': '#5555FF',
  '§a': '#55FF55',
  '§b': '#55FFFF',
  '§c': '#FF5555',
  '§d': '#FF55FF',
  '§e': '#FFFF55',
  '§f': '#FFFFFF',
}

function getTextParts(
    text: string,
    defaultColor: string,
    colorRanges: ColorRange[],
    bold = false,
    italic = false,
    boldRanges: StyleRange[] = [],
    italicRanges: StyleRange[] = [],
) {
  const parts: { text: string; color: string; bold: boolean; italic: boolean }[] = []
  for (let i = 0; i < text.length;) {
    const colorRange = colorRanges.find((r) => i >= r.start && i < r.end)
    const isBold = bold || boldRanges.some((r) => i >= r.start && i < r.end)
    const isItalic = italic || italicRanges.some((r) => i >= r.start && i < r.end)
    const color = colorRange?.color || defaultColor
    let end = i + 1
    while (end < text.length) {
      const nextColorRange = colorRanges.find((r) => end >= r.start && end < r.end)
      const nextColor = nextColorRange?.color || defaultColor
      const nextBold = bold || boldRanges.some((r) => end >= r.start && end < r.end)
      const nextItalic = italic || italicRanges.some((r) => end >= r.start && end < r.end)
      if (nextColor !== color || nextBold !== isBold || nextItalic !== isItalic) break
      end++
    }
    parts.push({ text: text.slice(i, end), color, bold: isBold, italic: isItalic })
    i = end
  }
  return parts
}

function renderTextWithRanges(
    text: string,
    defaultColor: string,
    colorRanges: ColorRange[],
    bold = false,
    italic = false,
    boldRanges: StyleRange[] = [],
    italicRanges: StyleRange[] = [],
) {
  return getTextParts(text, defaultColor, colorRanges, bold, italic, boldRanges, italicRanges).map((part, index) => (
      <span key={index} style={{ color: colorHex[part.color] ?? '#eeeeee', fontWeight: part.bold ? 'bold' : 'normal', fontStyle: part.italic ? 'italic' : 'normal' }}>{part.text}</span>
  ))
}

function buildTextWithRanges(
    text: string,
    defaultColor: string,
    colorRanges: ColorRange[],
    bold = false,
    italic = false,
    boldRanges: StyleRange[] = [],
    italicRanges: StyleRange[] = [],
) {
  return getTextParts(text, defaultColor, colorRanges, bold, italic, boldRanges, italicRanges)
      .map((part) => `${part.color || '§r'}${part.bold ? '§l' : ''}${part.italic ? '§o' : ''}${part.text}`)
      .join('')
}

function applyStyleToSelection(
    fieldId: string,
    ranges: StyleRange[],
    updateRanges: (ranges: StyleRange[]) => void,
    selections: Record<string, { start: number; end: number }>,
) {
  const selection = selections[fieldId]
  if (!selection || selection.start === selection.end) return false
  const { start, end } = selection
  const isAlreadyStyled = ranges.some((range) => range.start <= start && range.end >= end)
  const nextRanges = ranges.flatMap((range) => {
    if (range.end <= start || range.start >= end) return [range]
    const pieces: StyleRange[] = []
    if (range.start < start) pieces.push({ start: range.start, end: start })
    if (range.end > end) pieces.push({ start: end, end: range.end })
    return pieces
  })
  if (!isAlreadyStyled) nextRanges.push({ start, end })
  updateRanges(nextRanges.sort((a, b) => a.start - b.start))
  return true
}

function adjustRangesForEdit(oldText: string, newText: string, ranges: ColorRange[]) {
  let prefix = 0
  while (prefix < oldText.length && prefix < newText.length && oldText[prefix] === newText[prefix]) prefix++
  let suffix = 0
  while (suffix < oldText.length - prefix && suffix < newText.length - prefix && oldText[oldText.length - 1 - suffix] === newText[newText.length - 1 - suffix]) suffix++
  const oldChangedEnd = oldText.length - suffix
  const delta = newText.length - oldText.length
  return ranges.flatMap((range) => {
    if (range.end <= prefix) return [range]
    if (range.start >= oldChangedEnd) return [{ ...range, start: range.start + delta, end: range.end + delta }]
    return []
  })
}

let nextId = 1

function createTranslation(): Translation {
  return {
    id: nextId++,
    comment: '',
    key: '',
    title: '',
    titleColor: '',
    titleBold: false,
    titleItalic: false,
    titleColorRanges: [],
    titleBoldRanges: [],
    titleItalicRanges: [],
    extraLines: [],
  }
}

function createExtraLine(): ExtraLine {
  return {
    id: nextId++,
    text: '',
    color: '§7',
    bold: false,
    italic: false,
    colorRanges: [],
    boldRanges: [],
    italicRanges: [],
  }
}

// Reads formatting codes at the beginning of a segment.
// Any codes later in the text are left untouched so exporting won't silently remove them.
function parseSegment(raw: string, allowStyles: boolean) {
  let remaining = raw
  let color = ''
  let bold = false
  let italic = false

  while (remaining.startsWith('§') && remaining.length >= 2) {
    const code = remaining.slice(0, 2).toLowerCase()

    if (colors.some((item) => item.code === code && code !== '')) {
      color = code
      remaining = remaining.slice(2)
      continue
    }

    if (allowStyles && code === '§l') {
      bold = true
      remaining = remaining.slice(2)
      continue
    }

    if (allowStyles && code === '§o') {
      italic = true
      remaining = remaining.slice(2)
      continue
    }

    // Leave unsupported or inline formatting codes in the text.
    break
  }

  return { text: remaining, color, bold, italic }
}

function parseLangFile(contents: string): Translation[] {
  const parsed: Translation[] = []
  const pendingComments: string[] = []

  for (const rawLine of contents.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line) continue

    if (line.startsWith('#')) {
      pendingComments.push(line.slice(1).trimStart())
      continue
    }

    const equalsIndex = rawLine.indexOf('=')
    if (equalsIndex < 0) continue

    const key = rawLine.slice(0, equalsIndex).trim()
    const value = rawLine.slice(equalsIndex + 1)

    if (!key) continue

    // This editor's format uses the literal characters \\n between text segments.
    const segments = value.split('\\n')
    const title = parseSegment(segments.shift() ?? '', true)

    const extraLines: ExtraLine[] = segments.map((segment) => {
      const parsedSegment = parseSegment(segment, true)
      return {
        id: nextId++,
        text: parsedSegment.text,
        color: parsedSegment.color,
        bold: parsedSegment.bold,
        italic: parsedSegment.italic,
        colorRanges: [],
        boldRanges: [],
        italicRanges: [],
      }
    })

    parsed.push({
      id: nextId++,
      comment: pendingComments.join('\n'),
      key,
      title: title.text,
      titleColor: title.color,
      titleBold: title.bold,
      titleItalic: title.italic,
      titleColorRanges: [],
      titleBoldRanges: [],
      titleItalicRanges: [],
      extraLines,
    })

    pendingComments.length = 0
  }

  return parsed
}

function App() {
  const [fileName, setFileName] = useState('en_US')
  const [importMessage, setImportMessage] = useState('')
  const [selectionColors, setSelectionColors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [translations, setTranslations] = useState<Translation[]>([
    createTranslation(),
  ])

  const textInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const textSelections = useRef<Record<string, { start: number; end: number }>>({})

  function rememberSelection(fieldId: string, input: HTMLInputElement) {
    textSelections.current[fieldId] = { start: input.selectionStart ?? 0, end: input.selectionEnd ?? 0 }
  }

  function applyColorToSelection(
      fieldId: string, _text: string, chosenColor: string, ranges: ColorRange[],
      updateRanges: (ranges: ColorRange[]) => void,
  ) {
    const selection = textSelections.current[fieldId]
    if (!selection || selection.start === selection.end) return false
    const { start, end } = selection
    const nextRanges = ranges.flatMap((range) => {
      if (range.end <= start || range.start >= end) return [range]
      const pieces: ColorRange[] = []
      if (range.start < start) pieces.push({ ...range, end: start })
      if (range.end > end) pieces.push({ ...range, start: end })
      return pieces
    })
    if (chosenColor) nextRanges.push({ start, end, color: chosenColor })
    updateRanges(nextRanges.sort((a, b) => a.start - b.start))
    return true
  }

  function updateTranslation(
      id: number,
      changes: Partial<Translation>,
  ) {
    setTranslations((current) =>
        current.map((item) =>
            item.id === id ? { ...item, ...changes } : item,
        ),
    )
  }

  function addTranslation() {
    setTranslations((current) => [...current, createTranslation()])
  }

  function removeTranslation(id: number) {
    setTranslations((current) =>
        current.filter((item) => item.id !== id),
    )
  }

  function updateExtraLine(
      translation: Translation,
      lineId: number,
      changes: Partial<ExtraLine>,
  ) {
    updateTranslation(translation.id, {
      extraLines: translation.extraLines.map((line) =>
          line.id === lineId ? { ...line, ...changes } : line,
      ),
    })
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const hasExistingContent = translations.some((item) =>
        item.key.trim() ||
        item.title.trim() ||
        item.comment.trim() ||
        item.extraLines.some((line) => line.text.trim()),
    )

    if (
        hasExistingContent &&
        !window.confirm('Importing a file will replace the entries currently in the editor. Continue?')
    ) {
      event.target.value = ''
      return
    }

    try {
      const contents = await file.text()
      const parsed = parseLangFile(contents)

      if (parsed.length === 0) {
        setImportMessage('No translations were found. Check that the file uses key=value entries.')
        return
      }

      setTranslations(parsed)
      setFileName(file.name.replace(/\.lang$/i, '') || 'en_US')
      setImportMessage(`Imported ${parsed.length} ${parsed.length === 1 ? 'entry' : 'entries'} from ${file.name}.`)
    } catch {
      setImportMessage('Could not read that file. Please try another .lang file.')
    } finally {
      event.target.value = ''
    }
  }

  function generateFile() {
    const output = translations
        .filter((item) => item.key.trim())
        .map((item) => {
          const comment = item.comment.trim()
              ? `${item.comment.trim().split('\n').map((line) => `# ${line}`).join('\n')}\n`
              : ''

          const title = buildTextWithRanges(item.title, item.titleColor, item.titleColorRanges, item.titleBold, item.titleItalic, item.titleBoldRanges, item.titleItalicRanges)

          const extra = item.extraLines
              .filter((line) => line.text.length > 0)
              .map((line) =>
                  buildTextWithRanges(line.text, line.color, line.colorRanges, line.bold, line.italic, line.boldRanges, line.italicRanges),
              )

          return `${comment}${item.key.trim()}=${[title, ...extra].join('\\n')}`
        })
        .join('\n\n')

    const blob = new Blob([output], {
      type: 'text/plain;charset=utf-8',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName.trim() || 'en_US'}.lang`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
      <main className="app">
        <header className="page-header">
          <div className="eyebrow">MINECRAFT TOOLKIT</div>
          <h1>Lang Builder<span>.</span></h1>
          <p>Create formatted Minecraft language files without writing formatting codes manually.</p>
        </header>

        <section className="file-settings">
          <label htmlFor="fileName">OUTPUT FILE NAME</label>
          <div className="filename-input">
            <input
                id="fileName"
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                placeholder="en_US"
            />
            <span>.lang</span>
          </div>
        </section>

        <section className="import-control">
          <input
              ref={fileInputRef}
              type="file"
              accept=".lang,text/plain"
              onChange={handleImportFile}
              style={{ display: 'none' }}
          />
          <button
              className="add-translation-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
          >
            ↑ Import .lang file
          </button>
          <p className="import-status">
            {importMessage || 'Open an existing .lang file to edit its entries.'}
          </p>
        </section>

        <div className="section-heading">
          <div>
            <h2>Translations</h2>
            <p>Each entry becomes one translation in your file.</p>
          </div>
          <span className="count">{translations.length} entries</span>
        </div>

        <div className="translations">
          {translations.map((translation, index) => (
              <article className="translation-card" key={translation.id}>
                <div className="card-heading">
                  <h3>
                <span className="entry-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                    Translation
                  </h3>
                  {translations.length > 1 && (
                      <button
                          className="icon-button"
                          onClick={() => removeTranslation(translation.id)}
                          aria-label="Remove translation"
                          title="Remove translation"
                      >
                        ×
                      </button>
                  )}
                </div>

                <div className="field">
                  <label>COMMENT <span>(optional)</span></label>
                  <input
                      value={translation.comment}
                      onChange={(event) =>
                          updateTranslation(translation.id, {
                            comment: event.target.value,
                          })
                      }
                      placeholder="e.g. Ruby item"
                  />
                </div>

                <div className="field">
                  <label>TRANSLATION KEY</label>
                  <input
                      value={translation.key}
                      onChange={(event) =>
                          updateTranslation(translation.id, {
                            key: event.target.value,
                          })
                      }
                      placeholder="item.lv_be:ruby"
                  />
                </div>

                <div className="field">
                  <label>TITLE / MAIN TEXT</label>
                  <div className="text-controls">
                    <input
                        ref={(element) => { textInputRefs.current[`title-${translation.id}`] = element }}
                        value={translation.title}
                        onSelect={(event) => rememberSelection(`title-${translation.id}`, event.currentTarget)}
                        onClick={(event) => rememberSelection(`title-${translation.id}`, event.currentTarget)}
                        onKeyUp={(event) => rememberSelection(`title-${translation.id}`, event.currentTarget)}
                        onChange={(event) => {
                          const newText = event.target.value
                          updateTranslation(translation.id, { title: newText, titleColorRanges: adjustRangesForEdit(translation.title, newText, translation.titleColorRanges), titleBoldRanges: adjustRangesForEdit(translation.title, newText, translation.titleBoldRanges), titleItalicRanges: adjustRangesForEdit(translation.title, newText, translation.titleItalicRanges) })
                          rememberSelection(`title-${translation.id}`, event.currentTarget)
                        }}
                        placeholder="Mystical Ruby"
                    />
                    <select
                        aria-label="Title color"
                        value={selectionColors[`title-${translation.id}`] ?? translation.titleColor}
                        onChange={(event) => {
                          const chosenColor = event.target.value
                          setSelectionColors((current) => ({ ...current, [`title-${translation.id}`]: chosenColor }))
                          const applied = applyColorToSelection(
                              `title-${translation.id}`, translation.title, chosenColor, translation.titleColorRanges,
                              (titleColorRanges) => updateTranslation(translation.id, { titleColorRanges }),
                          )
                          if (!applied) updateTranslation(translation.id, { titleColor: chosenColor })
                        }}
                    >
                      {colors.map((color) => (
                          <option key={color.code} value={color.code}>
                            {color.name}
                          </option>
                      ))}
                    </select>
                    <button
                        type="button"
                        className={`style-button ${translation.titleBold ? 'active' : ''}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          const applied = applyStyleToSelection(`title-${translation.id}`, translation.titleBoldRanges, (titleBoldRanges) => updateTranslation(translation.id, { titleBoldRanges }), textSelections.current)
                          if (!applied) updateTranslation(translation.id, { titleBold: !translation.titleBold })
                        }}
                        title="Toggle title bold"
                        aria-label="Toggle title bold"
                    >B</button>
                    <button
                        type="button"
                        className={`style-button italic ${translation.titleItalic ? 'active' : ''}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          const applied = applyStyleToSelection(`title-${translation.id}`, translation.titleItalicRanges, (titleItalicRanges) => updateTranslation(translation.id, { titleItalicRanges }), textSelections.current)
                          if (!applied) updateTranslation(translation.id, { titleItalic: !translation.titleItalic })
                        }}
                        title="Toggle title italic"
                        aria-label="Toggle title italic"
                    >I</button>
                  </div>
                  <p className="format-hint">Select part of the text, then choose a color. Select text and use B/I for that selection, or use them with no selection for the whole line. Formatting codes stay invisible while you edit.</p>
                </div>

                <div className="extras-heading">
                  <div>
                    <h4>Additional text</h4>
                    <p>Optional lines beneath the title.</p>
                  </div>
                </div>

                {translation.extraLines.map((line) => (
                    <div className="extra-line" key={line.id}>
                      <input
                          ref={(element) => { textInputRefs.current[`line-${line.id}`] = element }}
                          value={line.text}
                          onSelect={(event) => rememberSelection(`line-${line.id}`, event.currentTarget)}
                          onClick={(event) => rememberSelection(`line-${line.id}`, event.currentTarget)}
                          onKeyUp={(event) => rememberSelection(`line-${line.id}`, event.currentTarget)}
                          onChange={(event) => {
                            const newText = event.target.value
                            updateExtraLine(translation, line.id, { text: newText, colorRanges: adjustRangesForEdit(line.text, newText, line.colorRanges), boldRanges: adjustRangesForEdit(line.text, newText, line.boldRanges), italicRanges: adjustRangesForEdit(line.text, newText, line.italicRanges) })
                            rememberSelection(`line-${line.id}`, event.currentTarget)
                          }}
                          placeholder="Makes you stronger"
                      />
                      <select
                          aria-label="Text color"
                          value={selectionColors[`line-${line.id}`] ?? line.color}
                          onChange={(event) => {
                            const chosenColor = event.target.value
                            setSelectionColors((current) => ({ ...current, [`line-${line.id}`]: chosenColor }))
                            const applied = applyColorToSelection(
                                `line-${line.id}`, line.text, chosenColor, line.colorRanges,
                                (colorRanges) => updateExtraLine(translation, line.id, { colorRanges }),
                            )
                            if (!applied) updateExtraLine(translation, line.id, { color: chosenColor })
                          }}
                      >
                        {colors.map((color) => (
                            <option key={color.code} value={color.code}>
                              {color.name}
                            </option>
                        ))}
                      </select>
                      <button
                          className={`style-button ${line.bold ? 'active' : ''}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            const applied = applyStyleToSelection(`line-${line.id}`, line.boldRanges, (boldRanges) => updateExtraLine(translation, line.id, { boldRanges }), textSelections.current)
                            if (!applied) updateExtraLine(translation, line.id, { bold: !line.bold })
                          }}
                          title="Toggle bold"
                          aria-label="Toggle bold"
                      >
                        B
                      </button>
                      <button
                          className={`style-button italic ${line.italic ? 'active' : ''}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            const applied = applyStyleToSelection(`line-${line.id}`, line.italicRanges, (italicRanges) => updateExtraLine(translation, line.id, { italicRanges }), textSelections.current)
                            if (!applied) updateExtraLine(translation, line.id, { italic: !line.italic })
                          }}
                          title="Toggle italic"
                          aria-label="Toggle italic"
                      >
                        I
                      </button>
                      <button
                          className="icon-button"
                          onClick={() =>
                              updateTranslation(translation.id, {
                                extraLines: translation.extraLines.filter(
                                    (item) => item.id !== line.id,
                                ),
                              })
                          }
                          title="Remove line"
                          aria-label="Remove line"
                      >
                        ×
                      </button>

                    </div>
                ))}

                <button
                    className="add-line-button"
                    onClick={() =>
                        updateTranslation(translation.id, {
                          extraLines: [
                            ...translation.extraLines,
                            createExtraLine(),
                          ],
                        })
                    }
                >
                  + Add text line
                </button>

                <div className="output-panels">
                  <div className="output-preview">
                    <div className="preview-label">GENERATED ENTRY</div>
                    <code>
                      {translation.comment && (
                          <span>{`${translation.comment.split('\n').map((line) => `# ${line}`).join('\n')}\n`}</span>
                      )}
                      <span>{translation.key || 'your.translation.key'}</span>
                      <span>=</span>
                      <span>{buildTextWithRanges(translation.title, translation.titleColor, translation.titleColorRanges, translation.titleBold, translation.titleItalic, translation.titleBoldRanges, translation.titleItalicRanges)}</span>
                      {translation.extraLines
                          .filter((line) => line.text.length > 0)
                          .map((line) => (
                              <span key={line.id}>
                                {'\\n'}
                                {buildTextWithRanges(line.text, line.color, line.colorRanges, line.bold, line.italic, line.boldRanges, line.italicRanges)}
                              </span>
                          ))}
                    </code>
                  </div>
                  <div className="rendered-entry-preview">
                    <div className="preview-label">IN-GAME PREVIEW</div>
                    <div className="rendered-lines">
                      <div className="rendered-line rendered-title">
                        {translation.title
                            ? renderTextWithRanges(translation.title, translation.titleColor, translation.titleColorRanges, translation.titleBold, translation.titleItalic, translation.titleBoldRanges, translation.titleItalicRanges)
                            : <span className="preview-placeholder">Your title preview</span>}
                      </div>
                      {translation.extraLines.map((line) => (
                          <div className="rendered-line" key={line.id}>
                            {line.text
                                ? renderTextWithRanges(line.text, line.color, line.colorRanges, line.bold, line.italic, line.boldRanges, line.italicRanges)
                                : <span className="preview-placeholder">Additional text preview</span>}
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
          ))}
        </div>

        <button className="add-translation-button" onClick={addTranslation}>
          <span>+</span> Add translation
        </button>

        <footer className="generate-footer">
          <div>
            <strong>Ready to export?</strong>
            <p>Your file is generated locally in your browser.</p>
          </div>
          <button className="generate-button" onClick={generateFile}>
            Generate .lang <span>↓</span>
          </button>
        </footer>
      </main>
  )
}

export default App