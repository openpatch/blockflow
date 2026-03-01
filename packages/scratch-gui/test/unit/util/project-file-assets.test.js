import {extensionFromUrl, EXTENSION_TO_FORMAT} from '../../../src/lib/project-file-assets';

describe('project-file-assets', () => {
    describe('extensionFromUrl', () => {
        test('extracts extension from simple URL', () => {
            expect(extensionFromUrl('https://example.com/cat.svg')).toBe('svg');
        });

        test('extracts extension from URL with query string', () => {
            expect(extensionFromUrl('https://example.com/sound.mp3?v=123')).toBe('mp3');
        });

        test('extracts extension from URL with hash', () => {
            expect(extensionFromUrl('https://example.com/image.png#section')).toBe('png');
        });

        test('handles uppercase extensions', () => {
            expect(extensionFromUrl('https://example.com/image.PNG')).toBe('png');
        });

        test('returns empty string for URL without extension', () => {
            expect(extensionFromUrl('https://example.com/asset')).toBe('');
        });

        test('extracts extension from relative URL', () => {
            expect(extensionFromUrl('assets/meow.wav')).toBe('wav');
        });
    });

    describe('EXTENSION_TO_FORMAT', () => {
        test('maps svg to ImageVector', () => {
            expect(EXTENSION_TO_FORMAT.svg).toEqual({
                dataFormat: 'svg',
                assetType: 'ImageVector'
            });
        });

        test('maps png to ImageBitmap', () => {
            expect(EXTENSION_TO_FORMAT.png).toEqual({
                dataFormat: 'png',
                assetType: 'ImageBitmap'
            });
        });

        test('maps mp3 to Sound', () => {
            expect(EXTENSION_TO_FORMAT.mp3).toEqual({
                dataFormat: 'mp3',
                assetType: 'Sound'
            });
        });

        test('maps wav to Sound', () => {
            expect(EXTENSION_TO_FORMAT.wav).toEqual({
                dataFormat: 'wav',
                assetType: 'Sound'
            });
        });

        test('maps jpeg to jpg ImageBitmap', () => {
            expect(EXTENSION_TO_FORMAT.jpeg).toEqual({
                dataFormat: 'jpg',
                assetType: 'ImageBitmap'
            });
        });
    });

    describe('fetchAndCacheAsset', () => {
        let fetchAndCacheAsset;
        let mockStorage;

        beforeEach(async () => {
            const mod = await import('../../../src/lib/project-file-assets');
            fetchAndCacheAsset = mod.fetchAndCacheAsset;

            mockStorage = {
                AssetType: {
                    ImageVector: 'ImageVector',
                    ImageBitmap: 'ImageBitmap',
                    Sound: 'Sound'
                },
                DataFormat: {
                    SVG: 'svg',
                    PNG: 'png',
                    JPG: 'jpg',
                    MP3: 'mp3',
                    WAV: 'wav'
                },
                builtinHelper: {
                    _store: jest.fn(() => 'abc123def456')
                }
            };

            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
                })
            );

            // Mock URL.createObjectURL / revokeObjectURL for getImageDimensions
            global.URL.createObjectURL = jest.fn(() => 'blob:mock');
            global.URL.revokeObjectURL = jest.fn();

            // Mock Image to simulate loaded dimensions
            global.Image = class {
                constructor () {
                    this._src = '';
                    setTimeout(() => {
                        this.naturalWidth = 200;
                        this.naturalHeight = 100;
                        if (this.onload) this.onload();
                    }, 0);
                }
                set src (val) { this._src = val; }
                get src () { return this._src; }
            };
        });

        afterEach(() => {
            delete global.fetch;
            delete global.URL.createObjectURL;
            delete global.URL.revokeObjectURL;
        });

        test('fetches and caches a costume (SVG)', async () => {
            const result = await fetchAndCacheAsset(
                {name: 'Cat', url: 'https://example.com/cat.svg'},
                'costume',
                mockStorage
            );

            expect(global.fetch).toHaveBeenCalledWith('https://example.com/cat.svg');
            expect(mockStorage.builtinHelper._store).toHaveBeenCalledWith(
                'ImageVector', 'svg', expect.any(Uint8Array)
            );
            expect(result).toEqual({
                name: 'Cat',
                tags: [],
                isPublic: true,
                rawURL: 'https://example.com/cat.svg',
                assetId: 'abc123def456',
                dataFormat: 'svg',
                md5ext: 'abc123def456.svg',
                rotationCenterX: 0,
                rotationCenterY: 0,
                bitmapResolution: 1
            });
        });

        test('fetches and caches a bitmap costume (PNG) with auto-center', async () => {
            const result = await fetchAndCacheAsset(
                {name: 'Photo', url: 'https://example.com/photo.png'},
                'costume',
                mockStorage
            );

            expect(mockStorage.builtinHelper._store).toHaveBeenCalledWith(
                'ImageBitmap', 'png', expect.any(Uint8Array)
            );
            expect(result.bitmapResolution).toBe(2);
            expect(result.dataFormat).toBe('png');
            expect(result.rotationCenterX).toBe(100);
            expect(result.rotationCenterY).toBe(50);
        });

        test('uses explicit centerX/centerY when provided', async () => {
            const result = await fetchAndCacheAsset(
                {name: 'Photo', url: 'https://example.com/photo.png', centerX: 10, centerY: 20},
                'costume',
                mockStorage
            );

            expect(result.rotationCenterX).toBe(10);
            expect(result.rotationCenterY).toBe(20);
        });

        test('fetches and caches a sound (MP3)', async () => {
            const result = await fetchAndCacheAsset(
                {name: 'Meow', url: 'https://example.com/meow.mp3'},
                'sound',
                mockStorage
            );

            expect(mockStorage.builtinHelper._store).toHaveBeenCalledWith(
                'Sound', 'mp3', expect.any(Uint8Array)
            );
            expect(result).toEqual({
                name: 'Meow',
                tags: [],
                isPublic: true,
                assetId: 'abc123def456',
                dataFormat: 'mp3',
                md5ext: 'abc123def456.mp3',
                sampleCount: 0,
                rate: 22050
            });
        });

        test('throws on unsupported format', async () => {
            await expect(
                fetchAndCacheAsset(
                    {name: 'Doc', url: 'https://example.com/doc.pdf'},
                    'costume',
                    mockStorage
                )
            ).rejects.toThrow('Unsupported asset format "pdf"');
        });

        test('throws on fetch failure', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({ok: false, status: 404})
            );

            await expect(
                fetchAndCacheAsset(
                    {name: 'Missing', url: 'https://example.com/missing.svg'},
                    'costume',
                    mockStorage
                )
            ).rejects.toThrow('Failed to fetch asset "Missing": 404');
        });
    });

    describe('processAssets', () => {
        let processAssets;
        let mockStorage;

        beforeEach(async () => {
            const mod = await import('../../../src/lib/project-file-assets');
            processAssets = mod.processAssets;

            mockStorage = {
                AssetType: {ImageVector: 'ImageVector', ImageBitmap: 'ImageBitmap', Sound: 'Sound'},
                DataFormat: {SVG: 'svg', PNG: 'png', MP3: 'mp3', WAV: 'wav'},
                builtinHelper: {
                    _store: jest.fn(() => 'test123')
                }
            };

            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
                })
            );
        });

        afterEach(() => {
            delete global.fetch;
        });

        test('returns empty array for empty input', async () => {
            const result = await processAssets([], 'costume', mockStorage);
            expect(result).toEqual([]);
        });

        test('returns empty array for null input', async () => {
            const result = await processAssets(null, 'costume', mockStorage);
            expect(result).toEqual([]);
        });

        test('processes multiple assets', async () => {
            const result = await processAssets(
                [
                    {name: 'A', url: 'https://example.com/a.svg'},
                    {name: 'B', url: 'https://example.com/b.png'}
                ],
                'costume',
                mockStorage
            );
            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('A');
            expect(result[1].name).toBe('B');
        });
    });

    describe('processSprites', () => {
        let processSprites;
        let mockStorage;

        beforeEach(async () => {
            const mod = await import('../../../src/lib/project-file-assets');
            processSprites = mod.processSprites;

            mockStorage = {
                AssetType: {ImageVector: 'ImageVector', ImageBitmap: 'ImageBitmap', Sound: 'Sound'},
                DataFormat: {SVG: 'svg', PNG: 'png', MP3: 'mp3', WAV: 'wav'},
                builtinHelper: {
                    _store: jest.fn(() => 'sprite123')
                }
            };

            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
                })
            );
        });

        afterEach(() => {
            delete global.fetch;
        });

        test('returns empty array for empty input', async () => {
            const result = await processSprites([], mockStorage);
            expect(result).toEqual([]);
        });

        test('processes a sprite with costumes and sounds', async () => {
            const result = await processSprites([{
                name: 'Cat',
                costumes: [{name: 'cat-a', url: 'https://example.com/cat-a.svg'}],
                sounds: [{name: 'meow', url: 'https://example.com/meow.mp3'}]
            }], mockStorage);

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Cat');
            expect(result[0].isStage).toBe(false);
            expect(result[0].variables).toEqual({});
            expect(result[0].blocks).toEqual({});
            expect(result[0].costumes).toHaveLength(1);
            expect(result[0].sounds).toHaveLength(1);
            expect(result[0].costumes[0].name).toBe('cat-a');
            expect(result[0].sounds[0].name).toBe('meow');
        });

        test('handles sprite with no sounds', async () => {
            const result = await processSprites([{
                name: 'Silent',
                costumes: [{name: 'pic', url: 'https://example.com/pic.svg'}]
            }], mockStorage);

            expect(result[0].sounds).toEqual([]);
        });
    });
});
