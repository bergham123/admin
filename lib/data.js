import fs from 'fs-extra';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data.json');

// قراءة البيانات مع قيم افتراضية
export async function readData() {
  if (!await fs.pathExists(DATA_FILE)) {
    const defaultData = { users: {}, bots: {} };
    await fs.writeJson(DATA_FILE, defaultData, { spaces: 2 });
    return defaultData;
  }
  return await fs.readJson(DATA_FILE);
}

// كتابة البيانات
export async function writeData(data) {
  await fs.writeJson(DATA_FILE, data, { spaces: 2 });
}

// الحصول على مستخدم
export async function getUser(email) {
  const data = await readData();
  return data.users[email] || null;
}

// تحديث مستخدم (دمج)
export async function updateUser(email, updates) {
  const data = await readData();
  if (!data.users[email]) data.users[email] = {};
  Object.assign(data.users[email], updates);
  await writeData(data);
}

// حذف مستخدم
export async function deleteUser(email) {
  const data = await readData();
  // إذا كان المستخدم حاجزاً بوتاً، نحرره
  if (data.users[email] && data.users[email].reserved_bot) {
    const bot = data.users[email].reserved_bot;
    if (data.bots[bot]) {
      data.bots[bot].available = true;
      delete data.bots[bot].reserved_by;
    }
  }
  delete data.users[email];
  await writeData(data);
}

// الحصول على قائمة البوتات المتاحة
export async function getAvailableBots() {
  const data = await readData();
  const available = [];
  for (const [name, info] of Object.entries(data.bots)) {
    if (info.available === true) available.push(name);
  }
  return available;
}

// حجز بوت لمستخدم
export async function reserveBot(email, botName) {
  const data = await readData();
  // تأكد من وجود البوت ومتوفر
  if (!data.bots[botName] || data.bots[botName].available !== true) {
    throw new Error('Bot not available');
  }
  // تأكد من أن المستخدم ليس لديه بوت محجوز مسبقاً
  for (const [name, info] of Object.entries(data.bots)) {
    if (info.reserved_by === email) {
      throw new Error('You already have a reserved bot');
    }
  }
  // حجز
  data.bots[botName].available = false;
  data.bots[botName].reserved_by = email;
  if (!data.users[email]) data.users[email] = {};
  data.users[email].reserved_bot = botName;
  await writeData(data);
}

// إلغاء حجز بوت (للأدمن)
export async function releaseBot(botName) {
  const data = await readData();
  if (data.bots[botName]) {
    data.bots[botName].available = true;
    delete data.bots[botName].reserved_by;
    // إزالة الحجز من المستخدم
    for (const [email, user] of Object.entries(data.users)) {
      if (user.reserved_bot === botName) {
        delete data.users[email].reserved_bot;
      }
    }
    await writeData(data);
  }
}

// إضافة بوت جديد (للأدمن)
export async function addBot(botName) {
  const data = await readData();
  if (data.bots[botName]) throw new Error('Bot already exists');
  data.bots[botName] = { available: false, reserved_by: null }; // يبدأ غير متاح حتى يتم تأكيد الربط
  await writeData(data);
}

// تأكيد ربط البوت (بعد مسح QR)
export async function confirmBot(botName) {
  const data = await readData();
  if (!data.bots[botName]) throw new Error('Bot not found');
  data.bots[botName].available = true;
  data.bots[botName].reserved_by = null;
  await writeData(data);
}

// حذف بوت (للأدمن)
export async function removeBot(botName) {
  const data = await readData();
  if (!data.bots[botName]) throw new Error('Bot not found');
  // إذا كان محجوزاً، نحرره من المستخدم
  if (data.bots[botName].reserved_by) {
    const email = data.bots[botName].reserved_by;
    if (data.users[email]) delete data.users[email].reserved_bot;
  }
  delete data.bots[botName];
  await writeData(data);
}
