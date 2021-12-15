import { Client } from "discord.js"

// Update Roles

import { setRole } from "./roleMessages"

// Voice to text channel

var voiceToTextChannelData: { [k: string]: VoiceToTextPair[] } = {}

class VoiceToTextPair
{
  textChannel: string
  voiceChannel: string
}

export const interpretVoiceToTextChannelSetting = async function(guildID: string, voiceToTextChannelMap: VoiceToTextPair[])
{
  voiceToTextChannelData[guildID] = voiceToTextChannelMap
}

export const setupVoiceChannelEventHandler = function(client: Client)
{
  client.on('voiceStateUpdate', async (oldState, newState) => {
    let prevTextChannelName: string
    if (oldState.channelId != null)
    {
      let voiceTextChannelPair = voiceToTextChannelData[oldState.guild.id].find((voiceTextChannelPair) => voiceTextChannelPair.voiceChannel == oldState.channelId)
      if (voiceTextChannelPair != null)
      {
        let textChannelIDToFind = voiceTextChannelPair.textChannel
        let prevTextChannel = await oldState.guild.channels.fetch(textChannelIDToFind)
        prevTextChannelName = prevTextChannel != null ? prevTextChannel.name : null
      }
    }
    let newTextChannelName: string
    if (newState.channelId != null)
    {
      let voiceTextChannelPair = voiceToTextChannelData[newState.guild.id].find((voiceTextChannelPair) => voiceTextChannelPair.voiceChannel == newState.channelId)
      if (voiceTextChannelPair != null)
      {
        let textChannelIDToFind = voiceTextChannelPair.textChannel
        let newTextChannel = await newState.guild.channels.fetch(textChannelIDToFind)
        newTextChannelName = newTextChannel != null ? newTextChannel.name : null
      }
    }

    if (oldState.channelId == null && newState.channelId != null && newTextChannelName != null)
    {
      setRole(newState.member.user, newState.guild, newTextChannelName, true)
    }
    else if (oldState.channelId != null && newState.channelId == null && prevTextChannelName != null)
    {
      setRole(oldState.member.user, oldState.guild, prevTextChannelName, false)
    }
    else if (oldState.channelId != newState.channelId && prevTextChannelName != null && newTextChannelName != null)
    {
      setRole(oldState.member.user, oldState.guild, prevTextChannelName, false)
      setRole(newState.member.user, newState.guild, newTextChannelName, true)
    }
  })
}