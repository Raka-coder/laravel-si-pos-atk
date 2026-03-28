<?php

namespace App\Http\Requests\Unit;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50', 'unique:units,name,'.$this->unit->id],
            'short_name' => ['required', 'string', 'max:10', 'unique:units,short_name,'.$this->unit->id],
        ];
    }
}
