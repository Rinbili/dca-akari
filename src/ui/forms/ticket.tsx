'use client';

import { State, createTicket } from '@/lib/actions';
import { useFormState } from 'react-dom';

export function TicketForm() {
  const initialState: State = {
    message: null,
    errors: {},
  };
  const [state, formAction] = useFormState(createTicket, initialState);
  return (
    <form action={formAction} className='form-control'>
      <label className='form-control'>
        <label className='label'>
          <span className='label-text'>设备类型</span>
        </label>
        <select
          name='deviceType'
          className='select select-bordered'
          aria-describedby='deviceType-error'
          required
        >
          <option value='laptop'>笔记本</option>
          <option value='desktop'>台式机</option>
          <option value='other'>其他</option>
        </select>
        <div
          className='label'
          id='deviceType-error'
          aria-live='polite'
          aria-atomic='true'
        >
          {state.errors?.deviceType &&
            state.errors.deviceType.map((error: string) => (
              <p className='label-text-alt text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
      </label>
      <label className='form-control'>
        <label className='label'>
          <span className='label-text'>故障描述</span>
        </label>
        <textarea
          name='content'
          placeholder='请输入故障描述'
          className='textarea textarea-bordered h-36'
          aria-describedby='content-error'
          required
        />
        <div
          className='label'
          id='content-error'
          aria-live='polite'
          aria-atomic='true'
        >
          {state.errors?.content &&
            state.errors.content.map((error: string) => (
              <p className='label-text-alt text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
      </label>
      <label className='form-control'>
        <label className='label'>
          <span className='label-text'>联系方式</span>
        </label>
        <input
          type='text'
          name='contact'
          placeholder='如「微信号:***」，确保能够联系到您'
          className='input input-bordered'
          aria-describedby='contact-error'
          required
        />
        <div
          className='label'
          id='contact-error'
          aria-live='polite'
          aria-atomic='true'
        >
          {state.errors?.contact &&
            state.errors.contact.map((error: string) => (
              <p className='label-text-alt text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>
      </label>
      <div className='divider'></div>
      <button type='submit' className='btn btn-primary'>
        提交
      </button>
    </form>
  );
}
