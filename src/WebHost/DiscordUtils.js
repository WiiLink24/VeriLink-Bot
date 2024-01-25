import axios from 'axios'
import fs from 'node:fs'
import path from 'node:path'
import qs from 'qs'

const config = JSON.parse(String(fs.readFileSync(path.resolve('config/config.json'))))
const emailFilter = fs.readFileSync(path.resolve('config/banneddomains.txt')).toString().split('\n')

async function getUser (accessToken, url = 'https://discord.com/api/users/@me') {
  const data = await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } })

  // If the request failed, return null
  if (data.status !== 200) return null

  return data
}

async function convertAccessCode (accessCode, url = 'https://discord.com/api/oauth2/token') {
  // Parameters for token request
  const params = qs.stringify(Object.assign({ grant_type: 'authorization_code', code: accessCode }, config.api.discord))
  const token = await axios.post(url, params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })

  if (token.data.error) return null
  return token.data.access_token
}

async function validate (user, ip) {
  const domain = user.data.email.split('@')[1]
  // Impose an email service ban. This is to prevent people from using throwaway emails to create accounts.
  if (emailFilter.includes(domain)) return false

  // take user IP and check if they are using a VPN
  if (ip !== '::1') {
    const isVPN = await axios.get(`https://vpnapi.io/api/${ip}?key=${config.api.vpnKey}`)
    if (isVPN?.data?.security?.vpn) return false
  }

  return true
}

export default {
  getUser,
  validate,
  convertAccessCode
}
