import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createMomentRepository } from './momentRepository'

const tempDirs: string[] = []

async function createTempDataFile(): Promise<string> {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'gratefulnessjar-moments-'))
  tempDirs.push(tempDir)
  return path.join(tempDir, 'moments.json')
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))
  )
})

describe('createMomentRepository', () => {
  it('shares persisted moments across independent repository instances', async () => {
    const dataFile = await createTempDataFile()
    const writer = createMomentRepository({ dataFile })

    await writer.createMoment({
      moment_date: '2026-04-14',
      title: 'First swim of the year',
      rating: 6,
    })

    const reader = createMomentRepository({ dataFile })
    const moments = await reader.getAllMoments()

    expect(moments).toHaveLength(1)
    expect(moments[0]).toMatchObject({
      moment_date: '2026-04-14',
      title: 'First swim of the year',
      rating: 6,
    })
  })

  it('allows multiple moments to share a date, unlike entries', async () => {
    const dataFile = await createTempDataFile()
    const repository = createMomentRepository({ dataFile })

    await repository.createMoment({
      moment_date: '2026-04-14',
      title: 'Morning swim',
      rating: 6,
    })
    await repository.createMoment({
      moment_date: '2026-04-14',
      title: 'Evening bonfire',
      rating: 7,
    })

    const moments = await repository.getAllMoments()

    expect(moments).toHaveLength(2)
    expect(moments.map((moment) => moment.title)).toContain('Morning swim')
    expect(moments.map((moment) => moment.title)).toContain('Evening bonfire')
  })

  it('rejects a non-integer rating', async () => {
    const dataFile = await createTempDataFile()
    const repository = createMomentRepository({ dataFile })

    await expect(
      repository.createMoment({
        moment_date: '2026-04-14',
        title: 'Half-remembered afternoon',
        rating: 4.5 as never,
      })
    ).rejects.toThrow(/whole number/)
  })

  it('dedupes imported moments by id and keeps the newer revision', async () => {
    const dataFile = await createTempDataFile()
    const repository = createMomentRepository({ dataFile })

    const original = {
      id: 'shared-id',
      moment_date: '2026-04-14',
      title: 'Original title',
      rating: 5 as const,
      created_at: 1000,
      updated_at: 1000,
    }

    expect(await repository.importMoments([original])).toEqual({ imported: 1 })

    // Same id, older revision — ignored
    expect(
      await repository.importMoments([
        { ...original, title: 'Stale title', updated_at: 500 },
      ])
    ).toEqual({ imported: 0 })

    // Same id, newer revision — replaces
    expect(
      await repository.importMoments([
        { ...original, title: 'Newer title', updated_at: 2000 },
      ])
    ).toEqual({ imported: 1 })

    const moments = await repository.getAllMoments()
    expect(moments).toHaveLength(1)
    expect(moments[0].title).toBe('Newer title')
  })

  it('clears the description when updated with a blank value', async () => {
    const dataFile = await createTempDataFile()
    const repository = createMomentRepository({ dataFile })

    const created = await repository.createMoment({
      moment_date: '2026-04-14',
      title: 'Quiet morning',
      description: 'Coffee on the porch',
      rating: 5,
    })
    expect(created.description).toBe('Coffee on the porch')

    const updated = await repository.updateMoment(created.id, {
      description: '   ',
    })

    expect(updated).not.toHaveProperty('description')
  })
})
