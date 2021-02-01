import toCss from "./main";

test("it works", () => {
  const xPath =
    '//div[@id="foo"][2]/span[@class="bar"]//a[contains(@class, "baz")]//img[1]';
  const css = toCss(xPath);
  expect(css).toEqual(
    "div#foo:nth-child(2) > span.bar a[class*=baz] img:nth-child(1)"
  );
});

test("attribute axis", () => {
  const xPath = '//people/person[@lastname="brown"]';
  const css = toCss(xPath);
  expect(css).toEqual('people > person[lastname="brown"]');
});

test("position filter", () => {
  const xPath = "/people/person[2]";
  const css = toCss(xPath);
  expect(css).toEqual("people > person:nth-child(2)");
});

test("contains filter", () => {
  const xPath = "/people/person//address[contains(@street, 'south')]";
  const css = toCss(xPath);
  expect(css).toEqual("people > person address[street*=south]");
});

test("id", () => {
  const xPath = '//people/person[@id="jed"]';
  const css = toCss(xPath);
  expect(css).toEqual("people > person#jed");
});

test("class", () => {
  const xPath = '//people/person[@class="jung"]';
  const css = toCss(xPath);
  expect(css).toEqual("people > person.jung");
});

test("multi filter", () => {
  const xPath = '/html/body/form/input[@id="id_username" and position()=2]';
  const css = toCss(xPath);
  expect(css).toEqual("html > body > form > input#id_username:nth-child(2)");
});

test("invalid multi filter", () => {
  expect(() => {
    const xPath = "/input[666 and position()=6]";
    toCss(xPath);
  }).toThrow();
});
