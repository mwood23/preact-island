<div align="center">
  [![PreactIsland(./docs/preact-island.svg)](./docs/preact-island.svg)
  <img class="img-light" src="https://github.com/mwood23/preact-island/blob/master/docs/preact-island.gif?raw=true" height=350px>
  <h1 align="center">Preact Island</h1>
  <p align="center">A 1.3kB module that helps you ship Preact components to any website. Especially useful for Shopify or CMS websites.</p>

  [![downloads][downloads-badge]][npmcharts]
  [![version][version-badge]][package]
  [![Supports Preact and React][preact-badge]][preact]
  [![MIT License][license-badge]][license]
</div>

## Why

Sometimes you need to embed a component onto someone else's website. This could be an Shopify widget, email sign up form, CMS comment list, social media share icon, etc. Creating these experiences are tedious and difficult because you aren't in control of the website your code will be executed on.

Preact Island helps you build these experiences by adding a lightweight layer on top of Preact. For <5kb, you get a React style workflow (with hooks!), and a framework for rendering your widget that will rerender based on prop changes anywhere in the document.

## Features

- 🚀 Render by selector, inline, or by a selector given on the executed script
- 🙏 5 ways to pass in props to your component
- 🪄 Prop changes sync to all components causing rerenders (not remounts)
- 👯‍♀️ Create as many instances of your component as you need with a single island
- 🧼 Does not mutate the `window`. Use as many islands as you'd like on one page!
- 🐣 Less than 1.3kB
- ☠️ Supports replacing the target selector
- 🏔 React friendly with `preact-compat`
- 🔧 Manually trigger rerenders with props
- 👔 Fully typed with TypeScript

## Installation

```sh
npm install --save preact-island
```

## Usage

```ts
TODO
```

## Differences to Preact Habitat

This library was heavily inspired by [Preact Habitat](https://github.com/zouhir/preact-habitat).

Key differences:

- Components rerender based on prop changes. This can be a `data-prop` attribute change on a host element, inside of a props script tag, or event on the executed script.
- You can add props to script element itself and they're passed to the component
- You can add props to a script tag that lives anywhere in the document and sync it up to the component
- You can replace the target container instead of rendering inside of it if you choose
- No double loading when mounting the component
- Calling render multiple times create many components
- There is a `rerender` method that allows you to manually alter props for the component
- All dataset attributes (`data-` on an element) are passed as props
- There is no `clientSpecified` flag. If you declare a `data-mount-in` prop on a script it will take priority over the `selector` given at `render`.

## API

## Credits

A huge thank you to [zouhir](https://github.com/zouhir) who is the author of [preact-habitat](https://github.com/zouhir/preact-habitat). This library is heavily inspired by his work on that library.

Artwork by [vik4graphic](https://lottiefiles.com/vik4graphic)

## License

[MIT](LICENSE) - Copyright (c) [Marcus Wood](https://www.marcuswood.io/)

## Replace

- If you use replace, you will not be able to add props to the host element (since it will be replaced)
- f you use replace, you will not be able to add props to a child script (since it will be replaced)

To add dynamic props to replace you can add a script in the document and pass in `data-props-for` or you can add props inline to the script placed on the page.

[version-badge]: https://img.shields.io/npm/v/preact-island.svg?style=flat-square
[package]: https://www.npmjs.com/package/preact-island
[downloads-badge]: https://img.shields.io/npm/dm/preact-island.svg?style=flat-square
[npmcharts]: http://npmcharts.com/compare/preact-island
[license-badge]: https://img.shields.io/npm/l/preact-island.svg?style=flat-square
[license]: https://github.com/mwood23/preact-island/blob/master/LICENSE
[preact-badge]: https://img.shields.io/badge/%E2%9A%9B%EF%B8%8F-preact-6F2FBF.svg?style=flat-square
[preact]: https://preactjs.com
[module-formats-badge]: https://img.shields.io/badge/module%20formats-umd%2C%20cjs%2C%20es-green.svg?style=flat-square
[github-star]: https://github.com/mwood23/preact-island/stargazers
