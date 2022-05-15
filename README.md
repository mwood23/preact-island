# preact-lego

## Replace

- If you use replace, you will not be able to add props to the host element (since it will be replaced)
- f you use replace, you will not be able to add props to a child script (since it will be replaced)

To add dynamic props to replace you can add a script in the document and pass in `data-props-for` or you can add props inline to the script placed on the page.
