import React, { useState } from 'react'

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string | string[];
  fallbackEmoji?: string;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const { src, alt, style, className, onError, fallbackSrc, fallbackEmoji, ...rest } = props

  // fallbackSrc를 배열로 정규화
  const fallbacks: string[] = fallbackSrc
    ? (Array.isArray(fallbackSrc) ? fallbackSrc : [fallbackSrc])
    : []

  // 현재 시도 중인 src 인덱스 (-1 = 원본 src)
  const [fallbackIndex, setFallbackIndex] = useState(-1)

  const currentSrc = fallbackIndex === -1 ? src : fallbacks[fallbackIndex]

  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    const nextIndex = fallbackIndex + 1
    if (nextIndex < fallbacks.length) {
      setFallbackIndex(nextIndex)
    } else {
      setFallbackIndex(fallbacks.length) // 모두 실패 → 이모지
      onError?.(e)
    }
  }

  // 모든 src 소진 → 이모지 fallback
  if (fallbackIndex >= fallbacks.length && fallbacks.length > 0) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 ${className ?? ''}`}
        style={style}
      >
        <span className="text-4xl select-none" role="img" aria-label={alt}>
          {fallbackEmoji ?? '👤'}
        </span>
      </div>
    )
  }

  // src가 없고 fallback도 없으면 이모지
  if (!currentSrc) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 ${className ?? ''}`}
        style={style}
      >
        <span className="text-4xl select-none" role="img" aria-label={alt}>
          {fallbackEmoji ?? '👤'}
        </span>
      </div>
    )
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  )
}
