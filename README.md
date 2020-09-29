# xpath-to-selector
convert xpath to css selector

## install
> npm install --save-dev css-to-selector

## usage
```JavaScript
import xPath2Selector from "xpath-to-selector";

const xPath =
  '//div[@id="foo"][2]/span[@class="bar"]//a[contains(@class, "baz")]//img[1]';
const css = xPath2Selector(xPath);
console.log(css); // => 'div#foo:nth-child(2) > span.bar a[class*=baz] img:nth-child(1)'
```

## why
In my one of my previous job I was working on a product that is similar to Cypress / Selenium. The product should allow the user to use either xpath or css selector, so I wrote a simple JavaScript convertor from xpath to css selector. This is an upgraded version of what I have at that time and it's rewritten in TypeScript.

The community already have [xpath-to-css](https://github.com/svenheden/xpath-to-css). But I think it would be nice to let others see my implementation if they don't like the Python and regexp based parser for xpath.

## license
[MIT](LICENSE)
