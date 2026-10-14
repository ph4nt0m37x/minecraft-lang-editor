
import { useState } from 'react'
import './App.css'

type ExtraLine = {
  id: number
  text: string
  color: string
  bold: boolean
  italic: boolean
}

type Translation = {
  id: number
  comment: string
  key: string
  title: string
  titleColor: string
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

let nextId = 1

function createTranslation(): Translation {
  return {
    id: nextId++,
    comment: '',
    key: '',
    title: '',
    titleColor: '',
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
  }
}

function formatText(
    text: string,
    color: string,
    bold = false,
    italic = false,
) {
  return `${color}${bold ? '§l' : ''}${italic ? '§o' : ''}${text}`
}

function App() {
  const [fileName, setFileName] = useState('en_US')
  const [translations, setTranslations] = useState<Translation[]>([
    createTranslation(),
  ])

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

  function generateFile() {
    const output = translations
        .filter((item) => item.key.trim())
        .map((item) => {
          const comment = item.comment.trim()
              ? `# ${item.comment.trim()}\n`
              : ''

          const title = formatText(item.title, item.titleColor)

          const extra = item.extraLines
              .filter((line) => line.text.length > 0)
              .map((line) =>
                  formatText(line.text, line.color, line.bold, line.italic),
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
                        value={translation.title}
                        onChange={(event) =>
                            updateTranslation(translation.id, {
                              title: event.target.value,
                            })
                        }
                        placeholder="Mystical Ruby"
                    />
                    <select
                        aria-label="Title color"
                        value={translation.titleColor}
                        onChange={(event) =>
                            updateTranslation(translation.id, {
                              titleColor: event.target.value,
                            })
                        }
                    >
                      {colors.map((color) => (
                          <option key={color.code} value={color.code}>
                            {color.name}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div className="minecraft-preview">
                <span
                    style={{
                      color: colorHex[translation.titleColor],
                    }}
                >
                  {translation.title || 'Your title preview'}
                </span>
                  </div>
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
                          value={line.text}
                          onChange={(event) =>
                              updateExtraLine(translation, line.id, {
                                text: event.target.value,
                              })
                          }
                          placeholder="Makes you stronger"
                      />
                      <select
                          aria-label="Text color"
                          value={line.color}
                          onChange={(event) =>
                              updateExtraLine(translation, line.id, {
                                color: event.target.value,
                              })
                          }
                      >
                        {colors.filter((color) => color.code !== '').map((color) => (
                            <option key={color.code} value={color.code}>
                              {color.name}
                            </option>
                        ))}
                      </select>
                      <button
                          className={`style-button ${line.bold ? 'active' : ''}`}
                          onClick={() =>
                              updateExtraLine(translation, line.id, {
                                bold: !line.bold,
                              })
                          }
                          title="Toggle bold"
                          aria-label="Toggle bold"
                      >
                        B
                      </button>
                      <button
                          className={`style-button italic ${line.italic ? 'active' : ''}`}
                          onClick={() =>
                              updateExtraLine(translation, line.id, {
                                italic: !line.italic,
                              })
                          }
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
                      <div className="minecraft-preview extra-preview">
                  <span
                      style={{
                        color: colorHex[line.color],
                        fontWeight: line.bold ? 'bold' : 'normal',
                        fontStyle: line.italic ? 'italic' : 'normal',
                      }}
                  >
                    {line.text || 'Your text preview'}
                  </span>
                      </div>
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

                <div className="output-preview">
                  <div className="preview-label">GENERATED ENTRY</div>
                  <code>
                    {translation.comment && (
                        <span>{`# ${translation.comment}\n`}</span>
                    )}
                    <span>{translation.key || 'your.translation.key'}</span>
                    <span>=</span>
                    <span>
                  {formatText(translation.title, translation.titleColor)}
                </span>
                    {translation.extraLines
                        .filter((line) => line.text.length > 0)
                        .map((line) => (
                            <span key={line.id}>
                      {'\\n'}
                              {formatText(
                                  line.text,
                                  line.color,
                                  line.bold,
                                  line.italic,
                              )}
                    </span>
                        ))}
                  </code>
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
