
import React from 'react';
import { useEffect, useRef } from "react";

export function usePrevious(value) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function useDoubleClick(callback) {
  /** callback ref Pattern **/
  const [elem, setElem] = React.useState(null)
  const callbackRef = React.useCallback(node => {
    setElem(node)
    callbackRef.current = node
  }, [])

  React.useEffect(() => {
    inputCallbackRef.current = callback
  })

  const countRef = React.useRef(0)
/** Refs for the timer **/
  const timerRef = React.useRef(null)
/**Input callback Ref for callback passed **/
  const inputCallbackRef = React.useRef(null)
  
  React.useEffect(() => {
    function handler() {
      const isDoubleClick = countRef.current + 1 === 2
      const timerIsPresent = timerRef.current
      if (timerIsPresent && isDoubleClick) {
        
        clearTimeout(timerRef.current)
        timerRef.current = null
        countRef.current = 0
        if (inputCallbackRef.current) {
          inputCallbackRef.current()
        }
      }
      if (!timerIsPresent) {
        countRef.current = countRef.current + 1
        const timer = setTimeout(() => {
          clearTimeout(timerRef.current)
          timerRef.current = null
          countRef.current = 0
        }, 300)
        timerRef.current = timer
      }
    }
    if (elem) {
      elem.addEventListener('click', handler)
    }
  return () => {
      if (elem) {
        elem.removeEventListener('click', handler)
      }
    }
  }, [elem])

  return [callbackRef, elem]
}