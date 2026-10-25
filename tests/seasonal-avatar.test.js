const assert = require("node:assert/strict");
const test = require("node:test");
const {
  ASSET_FILES,
  TIME_ZONE,
  getAvatarDecision,
  getCalendarDate,
} = require("../utils/seasonalAvatar");

function role(date) {
  return getAvatarDecision(date).role;
}

test("maps all five avatar roles to the provided assets", () => {
  assert.deepEqual(ASSET_FILES, {
    original: "avatar-original.png.jpeg",
    christmas: "avatar_christmas.png.jpeg",
    halloween: "avatar_halloween.png.jpeg",
    ramadan: "avatar-ramadan.png.jpeg",
    valentines: "avatar-valentine.png.jpeg",
  });
  assert.equal(role("2027-03-18"), "original");
  assert.equal(role("2027-10-31"), "halloween");
  assert.equal(role("2027-12-25"), "christmas");
  assert.equal(role("2027-02-14"), "valentines");
  assert.equal(role("2027-02-15"), "ramadan");
});

test("selects Halloween inclusively and returns to default outside the range", () => {
  for (const date of ["2026-10-01", "2026-11-02"]) {
    assert.equal(role(date), "halloween", date);
  }
  for (const date of ["2026-09-30", "2026-11-03"]) {
    assert.equal(role(date), "original", date);
  }
  assert.equal(role("2026-10-31"), "halloween");
});

test("selects Christmas inclusively across the year boundary", () => {
  for (const date of ["2026-12-01", "2027-01-08"]) {
    assert.equal(role(date), "christmas", date);
  }
  for (const date of ["2026-11-30", "2027-01-09"]) {
    assert.equal(role(date), "original", date);
  }
  assert.equal(role("2026-12-31"), "christmas");
  assert.equal(role("2027-01-01"), "christmas");
});

test("selects Valentine's Day inclusively", () => {
  for (const date of ["2026-02-01", "2026-02-16"]) {
    assert.equal(role(date), "valentines", date);
  }
  for (const date of ["2026-01-31", "2026-02-17"]) {
    assert.equal(role(date), "original", date);
  }
  assert.equal(role("2026-02-14"), "valentines");
});

test("Ramadan starts on its configured date and lasts 32 inclusive days", () => {
  assert.equal(role("2027-02-13"), "valentines");
  assert.equal(role("2027-02-14"), "valentines");
  assert.equal(role("2027-02-15"), "ramadan");
  assert.equal(role("2027-03-17"), "ramadan");
  assert.equal(role("2027-03-18"), "original");
});

test("calculates each recurring Ramadan start from the preceding scheduled start", () => {
  assert.equal(role("2027-02-14"), "valentines");
  assert.equal(role("2027-02-15"), "ramadan");
  assert.equal(role("2028-02-02"), "ramadan");
  assert.equal(role("2029-01-21"), "ramadan");
  assert.equal(role("2030-01-09"), "ramadan");
  assert.equal(role("2030-12-28"), "ramadan");
  assert.equal(role("2031-01-28"), "ramadan");
  assert.equal(role("2031-01-29"), "original");
});

test("special dates override Ramadan, while Ramadan overrides ordinary seasons", () => {
  assert.equal(role("2027-02-14"), "valentines");
  assert.equal(role("2036-10-31"), "halloween");
  assert.equal(role("2031-12-25"), "christmas");
  assert.equal(role("2031-12-20"), "ramadan");
  assert.equal(role("2031-12-26"), "ramadan");
});

test("follows Valentine's overlap example", () => {
  assert.equal(role("2027-02-01"), "valentines");
  assert.equal(role("2027-02-13"), "valentines");
  assert.equal(role("2027-02-14"), "valentines");
  assert.equal(role("2027-02-15"), "ramadan");
  assert.equal(role("2027-03-17"), "ramadan");
  assert.equal(role("2027-03-18"), "original");
});

test("follows Christmas overlap example, including the event-day override", () => {
  assert.equal(role("2031-12-01"), "christmas");
  assert.equal(role("2031-12-15"), "christmas");
  assert.equal(role("2031-12-16"), "ramadan");
  assert.equal(role("2031-12-24"), "ramadan");
  assert.equal(role("2031-12-25"), "christmas");
  assert.equal(role("2031-12-26"), "ramadan");
  assert.equal(role("2032-01-08"), "ramadan");
  assert.equal(role("2032-01-09"), "ramadan");
  assert.equal(role("2032-01-17"), "original");
});

test("follows Halloween overlap example", () => {
  assert.equal(role("2036-10-01"), "halloween");
  assert.equal(role("2036-10-30"), "ramadan");
  assert.equal(role("2036-10-31"), "halloween");
  assert.equal(role("2036-11-01"), "ramadan");
  assert.equal(role("2036-11-02"), "ramadan");
  assert.equal(role("2036-11-03"), "ramadan");
});

test("uses Cairo's local calendar at date boundaries and handles leap years", () => {
  assert.equal(TIME_ZONE, "Africa/Cairo");
  assert.equal(
    getCalendarDate(new Date("2027-02-13T21:59:59.000Z")),
    "2027-02-13"
  );
  assert.equal(
    getCalendarDate(new Date("2027-02-13T22:00:00.000Z")),
    "2027-02-14"
  );
  assert.equal(
    getCalendarDate(new Date("2028-02-29T12:00:00.000Z")),
    "2028-02-29"
  );
  assert.equal(role("2028-02-29"), "ramadan");
  assert.equal(role("2028-03-04"), "ramadan");
  assert.equal(role("2028-03-05"), "original");
});
