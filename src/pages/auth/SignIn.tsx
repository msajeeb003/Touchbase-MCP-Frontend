import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { loginFormSchema, type LoginFormValues } from '@/schema/auth/login.schema'
import { useLoginMutation } from '@/store/features/auth/authApi'
import { setCredentials } from '@/store/features/auth/authSlice'
import { useAppDispatch } from '@/store/hooks'
import { showError, showSuccess } from '@/utils/toast'
import AuthShell from '@/components/auth/AuthShell'
import {
  authDivider,
  authError,
  authFieldIcon,
  authFootnote,
  authInput,
  authLabel,
  authLink,
  authSubmit,
  authToggle,
} from '@/components/auth/authUi'
import { cn } from '@/lib/utils'


export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()

  const signInForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSignInSubmit = async (values: LoginFormValues) => {
    try {
      const response = await login({
        email: values.email,
        password: values.password,
      }).unwrap()

      if (response.success) {
        dispatch(
          setCredentials({
            token: response.data.accessToken,
            user: response.data.user,
          }),
        )

        showSuccess(response.message || 'Login successful')
        signInForm.reset()
        navigate('/dashboard')
      } else {
        showError(response.message || 'Login failed. Please try again.')
      }
    } catch (error: unknown) {
      showError((error as { data?: { message?: string } })?.data?.message || 'Login failed. Please try again.')
    }
  }

  return (
    <AuthShell
      title='Touch Base AI'
      subtitle='Transform your call transcripts into personalized follow-ups with AI'
    >
      <Form {...signInForm}>
        <form onSubmit={signInForm.handleSubmit(onSignInSubmit)}>
          <div className='space-y-5'>
            <FormField
              control={signInForm.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-2.5'>
                  <FormLabel className={authLabel}>Email address</FormLabel>
                  <div className='relative'>
                    <Mail className={authFieldIcon} />
                    <FormControl>
                      <Input
                        type='email'
                        autoComplete='email'
                        placeholder='you@company.com'
                        className={cn(authInput, 'pl-10')}
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className={authError} />
                </FormItem>
              )}
            />

            <FormField
              control={signInForm.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-2.5'>
                  <FormLabel className={authLabel}>Password</FormLabel>
                  <div className='relative'>
                    <Lock className={authFieldIcon} />
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete='current-password'
                        placeholder='••••••••'
                        className={cn(authInput, 'px-10')}
                        {...field}
                      />
                    </FormControl>
                    <button
                      type='button'
                      className={authToggle}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </button>
                  </div>
                  <FormMessage className={authError} />
                </FormItem>
              )}
            />

            <Button type='submit' disabled={isLoading} className={authSubmit}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className={authDivider} />

            <p className={authFootnote}>
              Don&apos;t have an account?{' '}
              <Link to='/auth/signup' className={authLink}>
                Create account
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </AuthShell>
  )
}
