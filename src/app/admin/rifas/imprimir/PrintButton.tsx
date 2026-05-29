'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding: '10px 22px', borderRadius: 8, border: 'none',
        background: '#1a1a1a', color: '#fff', fontWeight: 700,
        fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      🖨 Imprimir / Salvar PDF
    </button>
  )
}
