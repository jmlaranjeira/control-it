const { DateTime } = require("luxon");

/**
 * USER CONFIGURATIONS
 */

// Date range to submit
const startDate = { day: 14, month: 6, year: 2024 };
const endDate = { day: 18, month: 6, year: 2024 };

// Credentials
const Username = "@dehn.de";
const Password = "";

// If you have summer working hours enable, if not, disable
const summerSchedule = true;

// Summer working hours range
const summerStart = DateTime.fromObject({ day: 15, month: 6, year: 2025 });
const summerEnd = DateTime.fromObject({ day: 15, month: 9, year: 2025 });

// The work schedule should not include the lunch break, just the worked hours, it gets added automatically in code
const workSchedule = {
  winter: { start: { hour: 8, minute: 0 }, length: { hours: 8, minutes: 30 } },
  lunch: { start: { hour: 14, minute: 30 }, length: { hours: 0, minutes: 30 } },
  summer: { start: { hour: 8, minute: 0 }, length: { hours: 7, minutes: 0 } },
};

// If enabled, no requests are sent, you can check if it will send the right requests beforehand
const isDryRun = true;

/**
 * END USER CONFIGURATIONS
 */

const comidaEventTypeId = "e8e54e66-a996-48f2-8885-b0dbcacb86eb";
const jornadaEventTypeId = "d8cc9d74-ef29-4267-906b-24fda81e87ec";

let AccessToken;
main();

async function main() {
  printDryRunWarning();
  if (!isDryRun) {
    const loginData = await login(Username, Password);
    AccessToken = loginData.User.AccessToken;
  }
  if (AccessToken) {
    console.log("\x1b[42m%s\x1b[0m", "Access Token filled");
    console.log("--------------------------------------");
  }
  registerRange();
  printDryRunWarning();
}

function registerRange() {
  let start = DateTime.fromObject(startDate);
  let end = DateTime.fromObject(endDate);

  while (start <= end) {
    registerDay(AccessToken, start);
    start = start.plus({ days: 1 });
  }
}

async function registerDay(AccessToken, date) {
  const weekday = date.weekday;
  const isWeekend = weekday > 5;
  const isFriday = weekday === 5;

  const workJitter = Math.round(Math.random() * 10);
  const lunchJitter = Math.round(Math.random() * 10);

  if (isWeekend) {
    console.log("\x1b[31m%s\x1b[0m", date.toISODate(), "WEEKEND SKIP! 🙅");
    console.log("--------------------------------------");
    return;
  }

  // Short days
  if (
    (summerSchedule && isFriday) ||
    (summerSchedule && date >= summerStart && date <= summerEnd)
  ) {
    const workTtime = workSchedule.summer.start;
    const workStartRaw = date.set({
      hour: workTtime.hour,
      minute: workTtime.minute + workJitter,
    });

    const workStart = formatDate(workStartRaw);
    const workEnd = formatDate(workStartRaw.plus(workSchedule.summer.length));

    if (!isDryRun) {
      await postJornada(AccessToken, workStart, workEnd);
    }

    console.log("\x1b[34m%s\x1b[0m", date.toISODate(), "Short day sent! ✅");
    console.log("--------------------------------------");
    return;
  }

  // Regular days
  const workTtime = workSchedule.winter.start;
  const lunchTtime = workSchedule.lunch.start;

  const workStartRaw = date.set({
    hour: workTtime.hour,
    minute: workTtime.minute + workJitter,
  });
  const lunchStartRaw = date.set({
    hour: lunchTtime.hour,
    minute: lunchTtime.minute + lunchJitter,
  });

  const workStart = formatDate(workStartRaw);
  const workEnd = formatDate(
    workStartRaw
      .plus(workSchedule.winter.length)
      .plus(workSchedule.lunch.length)
  );
  const lunchStart = formatDate(lunchStartRaw);
  const lunchEnd = formatDate(lunchStartRaw.plus(workSchedule.lunch.length));

  if (!isDryRun) {
    await postJornada(AccessToken, workStart, workEnd);
    await postComida(AccessToken, lunchStart, lunchEnd);
  }

  console.log("\x1b[32m%s\x1b[0m", date.toISODate(), "Regular day sent! ✅");
  console.log("--------------------------------------");
}

function formatDate(date) {
  return date.toFormat("yyyy-MM-dd'T'HH':'mm':'ssZZ");
}

async function login(Username, Password) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    Username,
    Password,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const response = await fetch(
    "https://api.controlit.es/api/authenticate",
    requestOptions
  );
  return await response.json();
}

async function postJornada(AccessToken, StartDate, EndDate) {
  return await postManualRegister(
    AccessToken,
    StartDate,
    EndDate,
    jornadaEventTypeId
  );
}

async function postComida(AccessToken, StartDate, EndDate) {
  return await postManualRegister(
    AccessToken,
    StartDate,
    EndDate,
    comidaEventTypeId
  );
}

async function postManualRegister(
  AccessToken,
  StartDate,
  EndDate,
  EventTypeId
) {
  var myHeaders = buildHeaders(AccessToken);

  var raw = JSON.stringify({
    EventTypeId: EventTypeId,
    StartDate: StartDate,
    EndDate: EndDate,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  return await fetch(
    "https://api.controlit.es/api/events/manual-register",
    requestOptions
  );
}

function buildHeaders(AccessToken) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${AccessToken}`);

  return myHeaders;
}

function printDryRunWarning() {
  if (isDryRun) {
    console.log("\x1b[41m%s\x1b[0m", "**************************************");
    console.log("\x1b[41m%s\x1b[0m", "* 👻 DRY RUN NOTHING SUBMITTED!!! 👻 *");
    console.log("\x1b[41m%s\x1b[0m", "**************************************");
  }
}
