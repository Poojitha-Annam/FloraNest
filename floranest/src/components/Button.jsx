import { useState } from 'react'

function Button({ onClick, className = '', children, ...props }) {
  const [clicked, setClicked] = useState(false)

  function handleClick(event) {
    if (props.disabled) return

    setClicked(true)

    setTimeout(() => {
      setClicked(false)
    }, 150)

    onClick?.(event)
  }

  return (
    <button
      {...props}
      className={`${className} ${clicked ? 'clicked-button' : ''}`}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

export default Button