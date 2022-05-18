export const injectCSS = (style: string) => {
  document.head.insertAdjacentHTML('beforeend', `<style>${style}</style>`)
}
