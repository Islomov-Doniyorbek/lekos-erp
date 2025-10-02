import Link from 'next/link'
import React from 'react'
type h4 = {
    h4:string;
}
const Title = ({h4}:h4) => {
  return (
    <div className="top flex justify-between py-4 px-2">
        <strong>{h4}</strong>
        <Link href={"/dashboard"}>View All</Link>
    </div>
  )
}

export default Title
