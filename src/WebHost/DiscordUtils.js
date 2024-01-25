import axios from 'axios'
import fs from 'node:fs'
import path from 'node:path'

const config = JSON.parse(String(fs.readFileSync(path.resolve('config/config.json'))))

async function getUser (accessToken) {
  const data = await axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${accessToken}` } })

  // If the request failed, return null
  if (data.status !== 200) return null

  return data
}

async function validate (user, domains, ip) {
  const domain = user.data.email.split('@')[1]
  // Impose an email service ban. This is to prevent people from using throwaway emails to create accounts.
  if (domains.includes(domain)) return false

  // take user IP and check if they are using a VPN
  if (ip !== '::1') {
    const isVPN = await axios.get(`https://vpnapi.io/api/${ip}?key=${config.api.vpnKey}`)
    if (isVPN?.data?.security?.vpn) return false
  }

  return true
}

export default {
  getUser,
  validate
}
