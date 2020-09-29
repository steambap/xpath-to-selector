import toCss from "./main";

test("it works", () => {
  const xPath =
    '//div[@id="foo"][2]/span[@class="bar"]//a[contains(@class, "baz")]//img[1]';
  const css = toCss(xPath);
  expect(css).toEqual(
    "div#foo:nth-child(2) > span.bar a[class*=baz] img:nth-child(1)"
  );
});
