"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'

interface BarcodeReaderOptions {
  onCodeRead: (code: string) => void
  onError?: (error: string) => void
}

export function useBarcodeReader({ onCodeRead, onError }: BarcodeReaderOptions) {
  const [isActive, setIsActive] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  // Verificar suporte do navegador
  useEffect(() => {
    // Verificar se o navegador suporta BarcodeDetector ou se pode usar ZXing
    if ('BarcodeDetector' in window) {
      setIsSupported(true)
    } else {
      // Verificar se o navegador suporta getUserMedia (necessário para ZXing)
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setIsSupported(true)
        // Inicializar ZXing como fallback
        zxingReaderRef.current = new BrowserMultiFormatReader()
      } else {
        setIsSupported(false)
        setError('Leitura óptica não suportada neste navegador')
      }
    }
  }, [])

  const startScanning = useCallback(async () => {
    if (!isSupported) {
      onError?.('Leitura óptica não suportada')
      return
    }

    try {
      setError(null)
      setIsActive(true)

      if ('BarcodeDetector' in window) {
        // Usar API nativa do navegador
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })

        streamRef.current = stream
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()

          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code', 'pdf417', 'aztec', 'data_matrix']
          })

          const detectBarcodes = async () => {
            if (!videoRef.current || !isActive) return

            try {
              const barcodes = await barcodeDetector.detect(videoRef.current)
              
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue
                onCodeRead(code)
                stopScanning()
              }
            } catch (err) {
              console.warn('Erro ao detectar código:', err)
            }
          }

          intervalRef.current = setInterval(detectBarcodes, 100)
        }
      } else if (zxingReaderRef.current) {
        // Usar ZXing como fallback
        try {
          await zxingReaderRef.current.decodeFromVideoDevice(
            undefined, // Usar câmera padrão
            videoRef.current!,
            (result, error) => {
              if (result) {
                onCodeRead(result.getText())
                stopScanning()
              }
              if (error && !error.name.includes('NotFoundException')) {
                console.warn('Erro ZXing:', error)
              }
            }
          )
        } catch (err) {
          throw new Error('Erro ao inicializar ZXing')
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao acessar câmera'
      setError(errorMessage)
      onError?.(errorMessage)
      setIsActive(false)
    }
  }, [isSupported, onCodeRead, onError])

  const stopScanning = useCallback(() => {
    setIsActive(false)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    // Limpar ZXing se estiver sendo usado
    if (zxingReaderRef.current) {
      zxingReaderRef.current.reset()
    }
  }, [])

  // Limpar recursos ao desmontar
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [stopScanning])

  return {
    isActive,
    isSupported,
    error,
    videoRef,
    startScanning,
    stopScanning
  }
}
