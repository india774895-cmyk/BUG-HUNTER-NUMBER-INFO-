const axios = require('axios')

function normalize(num){
  let s = (num || '').toString().replace(/[^0-9+]/g,'')
  if(s.startsWith('00')) s = '+' + s.slice(2)
  if(s.length === 10 && !s.startsWith('+')) s = '+91' + s
  if(s.startsWith('0') && s.length>1) s = '+91' + s.slice(1)
  return s
}

function fakeLookup(num){
  const normalized = normalize(num)
  const last = normalized.slice(-4)
  const opList = ['Airtel','Jio','Vodafone','BSNL','Idea']
  const type = (parseInt(last) % 2 === 0) ? 'Mobile' : 'Landline'
  const operator = opList[parseInt(last) % opList.length]
  let country = 'India'
  if(normalized.startsWith('+1')) country = 'United States'
  if(normalized.startsWith('+44')) country = 'United Kingdom'
  const regionKey = normalized.slice(-10,-8)
  const regionMap = {'98':'Delhi','97':'Mumbai','96':'Karnataka','95':'Bengaluru','94':'Kolkata','93':'Punjab'}
  const region = regionMap[regionKey] || 'Unknown Region'
  return {
    number: normalized,
    country,
    type,
    operator,
    region,
    notes: `Generated at ${new Date().toISOString()} (fake-data)`
  }
}

module.exports = async (req, res) => {
  const { number } = req.query
  if(!number || number.length < 3) {
    res.status(400).send('Invalid number')
    return
  }
  const normalized = normalize(number)

  // If env vars are configured, try external API
  const API_KEY = process.env.API_KEY
  const EXTERNAL_BASE = process.env.EXTERNAL_API_BASE

  if(API_KEY && EXTERNAL_BASE){
    try{
      // Example external API call - change path/params per your provider
      const url = `${EXTERNAL_BASE.replace(/\/$/,'')}/lookup`
      const response = await axios.get(url, {
        params: { number: normalized },
        headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' },
        timeout: 10000
      })
      const data = response.data || {}
      const result = {
        number: data.number || normalized,
        country: data.country || data.country_name || 'Unknown',
        type: data.type || data.number_type || 'Unknown',
        operator: data.operator || data.carrier || '-',
        region: data.region || data.location || '-',
        notes: data.notes || `fetched ${new Date().toISOString()}`
      }
      res.json(result)
      return
    }catch(err){
      // external failed -> fallback
      console.error('External API failed, falling back to fake:', err.toString())
    }
  }

  // fallback deterministic fake lookup
  const out = fakeLookup(number)
  res.json(out)
}
