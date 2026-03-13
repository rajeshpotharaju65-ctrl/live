/**
 * =====================================================
 *  LiveStream Studio — Google Apps Script Backend
 * =====================================================
 *  Paste this entire file into your Google Apps Script
 *  editor (script.google.com), then:
 *   1. Deploy > New deployment > Web app
 *   2. Execute as: Me
 *   3. Who has access: Anyone
 *   4. Click Deploy — copy the URL
 *
 *  Your Google Sheet needs these tabs (sheets):
 *    - Rooms
 *    - Messages
 *    - Participants
 *    - Sessions
 * =====================================================
 */

const SS = SpreadsheetApp.getActiveSpreadsheet()

// Sheet names
const SHEETS = {
  rooms:        'Rooms',
  messages:     'Messages',
  participants: 'Participants',
  sessions:     'Sessions',
}

// ─── Auto-setup: create sheets if missing ────────────────────────────────────
function setupSheets() {
  const headers = {
    Rooms:        ['RoomID', 'DisplayName', 'Mode', 'StreamType', 'Action', 'Timestamp'],
    Messages:     ['RoomID', 'From', 'Text', 'Timestamp'],
    Participants: ['RoomID', 'DisplayName', 'PeerID', 'Action', 'Timestamp'],
    Sessions:     ['RoomID', 'HostName', 'StreamType', 'StartTime', 'EndTime', 'Duration'],
  }
  Object.entries(headers).forEach(([name, cols]) => {
    let sheet = SS.getSheetByName(name)
    if (!sheet) {
      sheet = SS.insertSheet(name)
      sheet.appendRow(cols)
      sheet.getRange(1, 1, 1, cols.length).setFontWeight('bold').setBackground('#1a1a2e').setFontColor('#ffffff')
    }
  })
}

// ─── GET handler ─────────────────────────────────────────────────────────────
function doGet(e) {
  setupSheets()
  const action = e.parameter.action || ''
  let result = {}

  try {
    switch (action) {
      case 'getMessages':
        result = handleGetMessages(e.parameter)
        break
      case 'getRooms':
        result = handleGetRooms(e.parameter)
        break
      case 'getParticipantCount':
        result = handleGetParticipantCount(e.parameter)
        break
      default:
        result = { status: 'ok', message: 'LiveStream Studio API is running', version: '1.0' }
    }
  } catch (err) {
    result = { error: err.message }
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
}

// ─── POST handler ─────────────────────────────────────────────────────────────
function doPost(e) {
  setupSheets()
  let body = {}
  try {
    body = JSON.parse(e.postData.contents)
  } catch (err) {
    return jsonResponse({ error: 'Invalid JSON body' })
  }

  let result = {}
  try {
    switch (body.action) {
      case 'logRoomEvent':
        result = handleLogRoomEvent(body)
        break
      case 'saveMessage':
        result = handleSaveMessage(body)
        break
      case 'logParticipant':
        result = handleLogParticipant(body)
        break
      case 'startSession':
        result = handleStartSession(body)
        break
      case 'endSession':
        result = handleEndSession(body)
        break
      default:
        result = { error: `Unknown action: ${body.action}` }
    }
  } catch (err) {
    result = { error: err.message }
  }

  return jsonResponse(result)
}

// ─── Handlers ────────────────────────────────────────────────────────────────

function handleLogRoomEvent(body) {
  const sheet = SS.getSheetByName(SHEETS.rooms)
  sheet.appendRow([
    body.roomId,
    body.displayName,
    body.mode,
    body.streamType,
    body.eventAction,
    body.timestamp || new Date().toISOString(),
  ])
  return { status: 'ok' }
}

function handleSaveMessage(body) {
  const sheet = SS.getSheetByName(SHEETS.messages)
  const ts = body.timestamp || new Date().toISOString()
  sheet.appendRow([body.roomId, body.from, body.text, ts])
  return { status: 'ok', timestamp: ts }
}

function handleGetMessages(params) {
  const sheet = SS.getSheetByName(SHEETS.messages)
  const data = sheet.getDataRange().getValues()
  const since = params.since || ''
  const roomId = params.roomId || ''

  const messages = []
  for (let i = 1; i < data.length; i++) {
    const [rId, from, text, timestamp] = data[i]
    if (String(rId) === String(roomId) && String(timestamp) > since) {
      messages.push({ roomId: rId, from, text, timestamp: String(timestamp) })
    }
  }
  return { messages }
}

function handleLogParticipant(body) {
  const sheet = SS.getSheetByName(SHEETS.participants)
  sheet.appendRow([
    body.roomId,
    body.displayName,
    body.peerId,
    body.eventAction,
    body.timestamp || new Date().toISOString(),
  ])
  return { status: 'ok' }
}

function handleGetParticipantCount(params) {
  const sheet = SS.getSheetByName(SHEETS.participants)
  const data = sheet.getDataRange().getValues()
  const roomId = params.roomId || ''

  const joined = new Set()
  const left = new Set()
  for (let i = 1; i < data.length; i++) {
    const [rId, , peerId, action] = data[i]
    if (String(rId) === String(roomId)) {
      if (action === 'join') joined.add(peerId)
      if (action === 'leave') left.add(peerId)
    }
  }
  const active = [...joined].filter(id => !left.has(id))
  return { count: active.length }
}

function handleGetRooms(params) {
  const sheet = SS.getSheetByName(SHEETS.rooms)
  const data = sheet.getDataRange().getValues()
  const rooms = []
  const seen = new Set()
  for (let i = data.length - 1; i >= 1; i--) {
    const [roomId, displayName, mode, streamType, action, timestamp] = data[i]
    if (!seen.has(roomId)) {
      seen.add(roomId)
      rooms.push({ roomId, displayName, mode, streamType, action, timestamp })
    }
  }
  return { rooms: rooms.slice(0, 20) }
}

function handleStartSession(body) {
  const sheet = SS.getSheetByName(SHEETS.sessions)
  sheet.appendRow([
    body.roomId,
    body.hostName,
    body.streamType,
    body.startTime || new Date().toISOString(),
    '', // EndTime filled later
    '', // Duration filled later
  ])
  return { status: 'ok' }
}

function handleEndSession(body) {
  const sheet = SS.getSheetByName(SHEETS.sessions)
  const data = sheet.getDataRange().getValues()
  // Find the latest matching session row with no EndTime
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(body.roomId) && !data[i][4]) {
      sheet.getRange(i + 1, 5).setValue(body.endTime || new Date().toISOString())
      sheet.getRange(i + 1, 6).setValue(body.duration + 's')
      return { status: 'ok' }
    }
  }
  return { status: 'not_found' }
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}
