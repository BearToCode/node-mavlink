#!/usr/bin/env node

import * as SerialPort from 'serialport'

import {
  MavLinkPacket, MavLinkPacketSplitter, MavLinkPacketParser,
  minimal, common, ardupilotmega, uavionix, icarous,
  dump,
} from '.'

import { Heartbeat, MavAutopilot } from './lib/minimal'
import { CommandInt, MavCmd, ParamRequestList, ParamRequestRead } from './lib/common'
import { MavLinkData, MavLinkProtocolV1, MavLinkProtocolV2 } from './lib/mavlink'

const REGISTRY = {
  ...minimal.REGISTRY,
  ...common.REGISTRY,
  ...ardupilotmega.REGISTRY,
  ...uavionix.REGISTRY,
  ...icarous.REGISTRY,
}

const port = new SerialPort('/dev/ttyACM0', { baudRate: 115200, autoOpen: true })
const reader = port
  .pipe(new MavLinkPacketSplitter())
  .pipe(new MavLinkPacketParser())

// port.on('data', buffer => {
//   console.log('Received buffer:')
//   dump(buffer)
// })
  
reader.on('data', (packet: MavLinkPacket) => {
  const clazz = REGISTRY[packet.header.msgid]
  if (clazz) {
    // dump(packet.buffer)
    const data = packet.protocol.data(packet.payload, clazz)
    // if (packet.header.msgid == 253) {
      const name = REGISTRY[packet.header.msgid].MSG_NAME
      console.log(`${name} (prot: ${packet.protocol.constructor['NAME']}, sysid: ${packet.header.sysid}, compid: ${packet.header.compid}, seq: ${packet.header.seq}, plen: ${packet.header.payloadLength})`)
      console.log(data)
    // }
  } else {
    console.log('UNKNOWN MESSAGE', packet.header.msgid)
  }
})

let seq = 0

function send(msg: MavLinkData) {
  console.log('Sending', msg.constructor['MSG_NAME'], `(seq: ${seq}, magic: ${msg.constructor['MAGIC_NUMBER']})`, '...')

  return new Promise((resolve, reject) => {
    const buffer = new MavLinkProtocolV2().serialize(msg, seq++)
    seq &= seq

    dump(buffer)

    port.write(buffer, err => {
      if (err) reject(err)
      else resolve(null)
    })
  })
}

port.on('open', async () => {
  // await sleep(5000)
  // await sendHeartbeat()
  
  // const msg = new ParamRequestList()
  // msg.targetSystem = 1
  // msg.targetComponent = 1
  // await send(msg)
  
  const msg = new CommandInt()
  msg.command = MavCmd.REQUEST_PROTOCOL_VERSION
  msg.param1 = 1
  await send(msg)  
})
