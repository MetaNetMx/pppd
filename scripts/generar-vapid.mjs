// Genera un par de claves VAPID para Web Push. Ejecuta: node scripts/generar-vapid.mjs
// Pega la pública en VITE_VAPID_PUBLIC_KEY (cliente) y la privada en VAPID_PRIVATE_KEY (servidor).
import webpush from 'web-push'

const { publicKey, privateKey } = webpush.generateVAPIDKeys()
console.log('\nClaves VAPID generadas:\n')
console.log('VITE_VAPID_PUBLIC_KEY=' + publicKey)
console.log('VAPID_PUBLIC_KEY=' + publicKey)
console.log('VAPID_PRIVATE_KEY=' + privateKey)
console.log('\n(La pública va en cliente y servidor; la privada SOLO en el servidor.)\n')
