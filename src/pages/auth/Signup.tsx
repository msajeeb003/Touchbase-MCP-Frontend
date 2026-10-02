import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { signupFormSchema, type SignupFormValues } from '@/schema/auth/signup.schema'
import { useRegisterMutation } from '@/store/features/auth/authApi'
import { setCredentials } from '@/store/features/auth/authSlice'
import { useAppDispatch } from '@/store/hooks'
import { showError, showSuccess } from '@/utils/toast'
import AuthShell from '@/components/auth/AuthShell'
import {
  authDivider,
  authError,
  authFieldIcon,
  authFootnote,
  authHint,
  authInput,
  authLabel,
  authLink,
  authSubmit,
  authToggle,
} from '@/components/auth/authUi'
import { cn } from '@/lib/utils'

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [register, { isLoading }] = useRegisterMutation()

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSignupSubmit = async (values: SignupFormValues) => {
    try {
      const response = await register({
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

        showSuccess(response.message || 'Registration successful')
        signupForm.reset()
        navigate('/dashboard')
      } else {
        showError(response.message || 'Registration failed. Please try again.')
      }
    }catch(error: unknown){
      showError((error as { data?: { message?: string } })?.data?.message || 'Registration failed. Please try again.')
    }

  }

  return (
    <AuthShell
      title='Create your account'
      subtitle='Start transforming your call transcripts into AI-powered follow-ups'
    >
      <Form {...signupForm}>
        <form onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
          <div className='space-y-5'>
            <FormField
              control={signupForm.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-2.5'>
                  <FormLabel className={authLabel}>Work email address</FormLabel>
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
              control={signupForm.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-2.5'>
                  <FormLabel className={authLabel}>Password</FormLabel>
                  <div className='relative'>
                    <Lock className={authFieldIcon} />
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete='new-password'
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
                  <FormDescription className={authHint}>
                    Use at least 8 characters with a mix of letters, numbers & symbols
                  </FormDescription>
                  <FormMessage className={authError} />
                </FormItem>
              )}
            />

            <FormField
              control={signupForm.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem className='space-y-2.5'>
                  <FormLabel className={authLabel}>Confirm password</FormLabel>
                  <div className='relative'>
                    <Lock className={authFieldIcon} />
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete='new-password'
                        placeholder='••••••••'
                        className={cn(authInput, 'px-10')}
                        {...field}
                      />
                    </FormControl>
                    <button
                      type='button'
                      className={authToggle}
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </button>
                  </div>
                  <FormMessage className={authError} />
                </FormItem>
              )}
            />

            <Button type='submit' disabled={isLoading} className={authSubmit}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>

            <div className={authDivider} />

            <p className={authFootnote}>
              Already have an account?{' '}
              <Link to='/auth/signin' className={authLink}>
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </AuthShell>
  )
}
