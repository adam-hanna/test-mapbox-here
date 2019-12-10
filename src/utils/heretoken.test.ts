import { 
  generateNonce,
  mutexSingleton, 
  storeToken,
  getTokenFromStorage,
  validateToken,
  fetchNewTokenFromAPI,
} from './hereToken';
require('dotenv').config()

const { 
  REACT_APP_HERE_MAPS_TEST_ACCESS_KEY_ID: key,
  REACT_APP_HERE_MAPS_TEST_ACCESS_KEY_SECRET: secret,
} = process.env
console.log('key, secret', key, secret)

test('singleton blocks functions', async (done) => {
  let foo = 'bar'
  const release1 = await mutexSingleton.mutex.acquire();
  const release2 = mutexSingleton.mutex.acquire()
    .then(() => {
      expect(foo).toEqual('baz')
      done()
    });

  foo = 'baz'
  release1()
});

test('generates nonce strings of random length', () => {
  let nonce = ''
  const lengths = [1, 10, 20]
  lengths.forEach(l => {
    nonce = generateNonce(l)
    expect(typeof nonce).toEqual('string')
    expect(nonce.length).toEqual(l)
  })
});

test('it stores and retrieves a token in local storage', async (done) => {
  const token =  {
    AccessToken: 'foo',
    TokenType: 'bar',
    ExpiresIn: 100,
  }
  const key = 'test-here-token'

  await storeToken(token, key)

  const token1 = await getTokenFromStorage(key)
  expect(token).toStrictEqual(token1)

  done()
});

test('it properly validates tokens', () => {
  [
    {
      toPass: false,
      token: undefined,
      goodUntil: 0,
    },
    {
      toPass: false,
      token: { AccessToken: 'foo', TokenType: 'bar', ExpiresIn: (new Date().getTime() / 1000) - 100000 },
      goodUntil: 1,
    },
    {
      toPass: true,
      token: { AccessToken: 'foo', TokenType: 'bar', ExpiresIn: (new Date().getTime() / 1000) + 100000 },
      goodUntil: 1,
    }
  ].forEach(t => {
    expect(validateToken({ token: t.token, goodUntil: t.goodUntil })).toEqual(t.toPass)
  })
});

test('it properly fetches new tokens from the api', async (done) => {
  try {
    const objKeys = ['AccessToken', 'TokenType', 'ExpiresIn']
    const token = await fetchNewTokenFromAPI({ key: key || '', secret: secret || '' })
    Object(token).keys().forEach((k: string) => expect(objKeys).toContain(k))
  } catch (e) {
    console.error('err fetching from api', e)
    expect(e).toEqual(null)
  } finally {
    done()
  }
});
