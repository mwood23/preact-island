<div align="center">
  <img src="https://github.com/mwood23/preact-island/blob/master/docs/preact-island.gif?raw=true" height=300px>
</div>

[![downloads][downloads-badge]][npmcharts]
[![version][version-badge]][package]
[![gzip size][gzip-badge]][unpkg-dist]
[![module formats: umd, cjs, and es][module-formats-badge]][unpkg-dist]
[![Supports Preact and React][preact-badge]][preact]
[![MIT License][license-badge]][license]

## Preact Habitat

## Replace

- If you use replace, you will not be able to add props to the host element (since it will be replaced)
- f you use replace, you will not be able to add props to a child script (since it will be replaced)

To add dynamic props to replace you can add a script in the document and pass in `data-props-for` or you can add props inline to the script placed on the page.
