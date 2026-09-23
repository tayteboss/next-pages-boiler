const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.join(__dirname, '..');
const compile = (source) => ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
}).outputText;

// Use the installed TypeScript compiler; no test bundler or browser DOM needed.
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (mod, filename) => {
    mod._compile(compile(fs.readFileSync(filename, 'utf8')), filename);
  };
}

function load(file, mocks = {}) {
  const filename = path.join(root, file);
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  mod.require = (name) => Object.hasOwn(mocks, name)
    ? mocks[name]
    : Module.prototype.require.call(mod, name);
  mod._compile(compile(fs.readFileSync(filename, 'utf8')), filename);
  return mod.exports;
}

test('image loader accepts local/static assets and still resizes Sanity images', () => {
  const loader = load('lib/sanityImageLoader.ts').default;
  for (const src of ['/photo.jpg', '/_next/static/media/photo.jpg', 'data:image/png;base64,AA==']) {
    assert.equal(loader({ src, width: 640 }), src);
  }
  const url = new URL(loader({
    src: 'https://cdn.sanity.io/images/demo/production/photo.jpg',
    width: 640,
    quality: 80,
  }));
  assert.equal(url.searchParams.get('w'), '640');
  assert.equal(url.searchParams.get('q'), '80');
});

test('matching media queries render children instead of a plain object', () => {
  for (const matches of [true, false]) {
    const Container = load('components/common/MediaQueryContainer/MediaQueryContainer.tsx', {
      '../../../hooks/useMediaQuery': () => matches,
    }).default;
    const html = renderToStaticMarkup(React.createElement(Container, { query: '(min-width: 1px)' }, 'content'));
    assert.equal(html, matches ? 'content' : '');
  }
});

test('scroll lock is safe in SSR and releases the class on cleanup', () => {
  const useNoScroll = load('hooks/useNoScroll.tsx').default;
  function ServerComponent() {
    useNoScroll(true);
    return null;
  }
  assert.equal(renderToStaticMarkup(React.createElement(ServerComponent)), '');

  let effect;
  const useLock = load('hooks/useNoScroll.tsx', {
    react: { useEffect: (callback) => { effect = callback; } },
  }).default;
  const originalDocument = global.document;
  const classes = new Set();
  global.document = { documentElement: { classList: {
    contains: (name) => classes.has(name),
    add: (name) => classes.add(name),
    remove: (name) => classes.delete(name),
  } } };
  try {
    useLock(true);
    const cleanup = effect();
    assert.ok(classes.has('no-scroll'));
    cleanup();
    assert.ok(!classes.has('no-scroll'));
    classes.add('no-scroll');
    useLock(true);
    effect()();
    assert.ok(classes.has('no-scroll'), 'preserve a pre-existing lock');
  } finally {
    if (originalDocument === undefined) delete global.document;
    else global.document = originalDocument;
  }
});

const image = (width, height) => ({
  mediaType: 'image',
  image: { alt: 'Photo', asset: {
    url: 'https://cdn.sanity.io/images/demo/production/photo.jpg',
    metadata: { dimensions: { width, height } },
  } },
});

test('images size from the selected asset, honor overrides, and load lazily', () => {
  for (const mobile of [false, true]) {
    const ImageComponent = load('components/common/MediaStack/ImageComponent.tsx', {
      '../../../hooks/useMediaQuery': () => mobile,
      'next/image': ({ loading }) => React.createElement('img', { loading }),
    }).default;
    const props = { data: image(800, 600), useMobileData: image(600, 800), inView: false, noFadeInAnimation: true };
    const html = renderToStaticMarkup(React.createElement(ImageComponent, props));
    assert.match(html, mobile ? /padding-top:133\.33333333333331%/ : /padding-top:75%/);
    assert.match(html, /loading="lazy"/);
    const override = renderToStaticMarkup(React.createElement(ImageComponent, { ...props, aspectPadding: '50%', isPriority: true }));
    assert.match(override, /padding-top:50%/);
    assert.match(override, /loading="eager"/);
  }
});

test('video sizing uses Mux metadata and lazy loading allows priority opt-in', () => {
  let playerProps;
  const Video = load('components/common/MediaStack/VideoComponent.tsx', {
    '../../../hooks/useMediaQuery': () => true,
    '@mux/mux-player-react/lazy': (props) => { playerProps = props; return null; },
  }).default;
  const props = {
    data: { mediaType: 'video', video: { asset: { playbackId: 'desktop', data: { aspect_ratio: '16:9' } } } },
    useMobileData: { mediaType: 'video', video: { asset: { playbackId: 'mobile', data: { aspect_ratio: '3:4' } } } },
    inView: false,
    noFadeInAnimation: true,
  };
  const html = renderToStaticMarkup(React.createElement(Video, props));
  assert.match(html, /padding-top:133\.33333333333331%/);
  assert.equal(playerProps.playbackId, 'mobile');
  assert.equal(playerProps.loading, 'viewport');
  const override = renderToStaticMarkup(React.createElement(Video, { ...props, aspectPadding: '50%', isPriority: true }));
  assert.match(override, /padding-top:50%/);
  assert.equal(playerProps.loading, 'page');
});

test('MediaStack keeps 2160p minimum while defaulting both media types to lazy', () => {
  let childProps;
  const record = (props) => { childProps = props; return null; };
  const Stack = load('components/common/MediaStack/index.tsx', {
    './ImageComponent': record,
    './VideoComponent': record,
    'react-intersection-observer': { useInView: () => ({ ref: null, inView: false }) },
  }).default;
  for (const mediaType of ['image', 'video']) {
    renderToStaticMarkup(React.createElement(Stack, { data: { mediaType }, aspectPadding: '50%' }));
    assert.equal(childProps.lazyLoad, true);
    assert.equal(childProps.aspectPadding, '50%');
    if (mediaType === 'video') assert.equal(childProps.minResolution, '2160p');
  }
});

test('project routes parameterize slugs, return 404s, and revalidate', async () => {
  const file = 'pages/work/[slug].tsx';
  const unconfigured = load(file, { '../../client': null });
  assert.deepEqual(await unconfigured.getStaticPaths(), { paths: [], fallback: 'blocking' });
  assert.equal((await unconfigured.getStaticProps({ params: { slug: 'missing' } })).notFound, true);

  const slug = 'a"quoted-slug';
  let result = { slug: { current: slug } };
  const route = load(file, { '../../client': { fetch: async (query, params) => {
    assert.ok(query.includes('$slug'));
    assert.ok(!query.includes(slug));
    assert.deepEqual(params, { slug });
    return result;
  } } });
  const page = await route.getStaticProps({ params: { slug } });
  assert.deepEqual(page.props.data, result);
  assert.equal(page.revalidate, 60);
  result = null;
  assert.deepEqual(await route.getStaticProps({ params: { slug } }), { notFound: true, revalidate: 60 });
});

test('settings build tolerates missing config, fetch failure, and write failure', async () => {
  const source = fs.readFileSync(path.join(root, 'scripts/api.js'), 'utf8');
  for (const scenario of ['missing-config', 'fetch-error', 'write-error', 'success']) {
    const writes = [];
    const logs = [];
    const sandbox = {
      __dirname: path.join(root, 'scripts'),
      module: { exports: {} },
      process: { env: scenario === 'missing-config' ? {} : {
        NEXT_PUBLIC_SANITY_PROJECT_ID: 'demo', NEXT_PUBLIC_SANITY_DATASET: 'production',
      } },
      console: { warn() {}, log: (message) => logs.push(message) },
      require: (name) => ({
        '@sanity/client': { createClient: () => ({ fetch: async () => {
          if (scenario === 'fetch-error') throw new Error('offline');
          return { title: 'Fresh' };
        } }) },
        'node:path': path,
        'node:fs/promises': {
          readFile: async () => {
            if (scenario === 'fetch-error') return '{"title":"Cached"}';
            throw new Error('ENOENT');
          },
          mkdir: async () => {},
          writeFile: async (_file, contents) => {
            if (scenario === 'write-error') throw new Error('EACCES');
            writes.push(contents);
          },
        },
      })[name],
    };
    vm.runInNewContext(source, sandbox);
    const data = await sandbox.module.exports.getSiteData();
    if (scenario === 'missing-config') assert.equal(writes[0], '{}');
    if (scenario === 'fetch-error') {
      assert.equal(data.title, 'Cached');
      assert.equal(writes.length, 0);
    }
    if (scenario === 'write-error') assert.equal(logs.length, 0);
    if (scenario === 'success') assert.equal(writes[0], '{"title":"Fresh"}');
  }
});
