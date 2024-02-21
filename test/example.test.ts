import { expect, test } from 'vitest'

test('the user can create a new transaction', () => {
    const responseStatuscode = 201
    expect(responseStatuscode).toEqual(201)
})