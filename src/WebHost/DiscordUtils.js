import axios from 'axios'

async function getUser (accessToken) {
  const data = await axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${accessToken}` } })

  // If the request failed, return null
  if (data.status !== 200) return null

  return data
}

export default {
  getUser
}
