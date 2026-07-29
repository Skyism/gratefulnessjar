import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createEntryRepository } from './entryRepository'

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))
  )
})

describe('createEntryRepository', () => {
  it('shares persisted entries across independent repository instances', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'gratefulnessjar-'))
    tempDirs.push(tempDir)

    const dataFile = path.join(tempDir, 'entries.json')
    const writer = createEntryRepository({ dataFile })

    await writer.createEntry({
      entry_date: '2026-04-14',
      gratitude_text: 'Sunlight on the kitchen floor',
      rating: 6,
    })

    const reader = createEntryRepository({ dataFile })
    const entries = await reader.getAllEntries()

    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({
      entry_date: '2026-04-14',
      gratitude_text: 'Sunlight on the kitchen floor',
      rating: 6,
    })
  })
})
