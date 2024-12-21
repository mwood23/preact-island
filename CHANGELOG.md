## 1.0.4

- Add subtree checking for prop scripts so that it works well in a React rerender context

## 1.0.5

- Bad publish, oopsie! Use 1.0.6.

## 1.0.6

- Fix peer deps so it correctly resolves.

Thanks [@rschristian](https://github.com/rschristian)

## 1.1.0

- 🧩 Experimental web component support including web component portals! This API may change drastically over time so if you use it keep that in mind. If you have ideas on how to improve it file an issue!
- Migrate examples over to webpack and off of Microbundle + Preact CLI. Now the development server injects the scripts just like you would in production to give you the closest environment to.
- Internal island lib now ships with support for the shadow dom (even if you don't want to use the build in island web components API)
- Documentation updates

## 1.1.1

- Fixed bug where rendering a web component multiple times on a page would not function as expected. This was due to the custom element being defined twice causing everything to silently fail.

## 1.1.2

- Fixed bug where data-mount-in did not function with web components

## 1.2.0

- Fix package.json exports field
