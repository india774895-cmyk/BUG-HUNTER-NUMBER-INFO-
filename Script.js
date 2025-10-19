const $ = sel => document.querySelector(sel)
const resultEl = $('#result')
const errorEl = $('#error')

async function lookup(number){
  errorEl.classList.add('hidden')
  resultEl.classList.add('hidden')
  try{
    const res = await fetch(`/api/info/${encodeURIComponent(number)}`)
    if(!res.ok){
      const text = await res.text()
      throw new Error(text || 'API error')
    }
    const data = await res.json()
    $('#r-number').textContent = data.number || '-'
    $('#r-country').textContent = data.country || '-'
    $('#r-type').textContent = data.type || '-'
    $('#r-operator').textContent = data.operator || '-'
    $('#r-region').textContent = data.region || '-'
    $('#r-notes').textContent = data.notes || '-'
    resultEl.classList.remove('hidden')
  }catch(err){
    errorEl.textContent = err.message || 'Unknown error'
    errorEl.classList.remove('hidden')
  }
}

$('#lookup').addEventListener('click', ()=>{
  const num = $('#number').value.trim()
  if(!num) return
  lookup(num)
})

// allow pressing Enter in input
$('#number').addEventListener('keydown', e=>{
  if(e.key === 'Enter') $('#lookup').click()
})
