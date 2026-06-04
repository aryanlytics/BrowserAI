import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type Props = {}

const signin = (props: Props) => {
  return (
    <div>
      <div className="flex justify-center items-center min-h-screen bg-green-500">
        <form action="">

          <Label>Email</Label>
          <Input></Input>

          <Label>Password</Label>
          <Input></Input>

          <Button></Button>

        </form>
      </div>
    </div>
  )
}

export default signin