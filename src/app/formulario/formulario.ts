import { Component, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-formulario',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class Formulario {
  private fb = inject(FormBuilder);
  modalAberto = false;
  dadosCadastrados: {
    nome: string;
    email: string;
    telefones: string[];
    idade: number;
    cidade: string;
    genero: string;
  } | null = null;

  formulario = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    idade: [null, [Validators.required, Validators.min(18)]],
    cidade: ['', [Validators.required]],
    genero: ['', [Validators.required]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confSenha: ['', [Validators.required]],
    novoTelefone: new FormControl(''),
    telefones: new FormArray<FormControl<string>>([], [this.validarQuantidadeTelefones]),
    termos: [false, [Validators.requiredTrue]],
  }, { validators: this.validarSenhasIguais });

  addTelefone() {
    const novoTelefone = this.formulario.get('novoTelefone')?.value?.trim();
    if (novoTelefone) {
      this.telefones.push(new FormControl(novoTelefone, { nonNullable: true }));
      this.telefones.markAsDirty();
      this.telefones.updateValueAndValidity();
      this.formulario.updateValueAndValidity();
      this.formulario.get('novoTelefone')?.setValue('');
    }
  }

  removerTelefone(index: number) {
    (this.formulario.get('telefones') as FormArray).removeAt(index);
    this.telefones.markAsDirty();
    this.telefones.updateValueAndValidity();
    this.formulario.updateValueAndValidity();
  }

  get telefones(): FormArray<FormControl<string>> {
    return this.formulario.get('telefones') as FormArray<FormControl<string>>;
  }

  get nomeControl(): AbstractControl | null {
    return this.formulario.get('nome');
  }

  get emailControl(): AbstractControl | null {
    return this.formulario.get('email');
  }

  private validarSenhasIguais(control: AbstractControl) {
    const senha = control.get('senha')?.value;
    const confSenha = control.get('confSenha')?.value;
    if (senha && confSenha && senha !== confSenha) {
      return { senhasDiferentes: true };
    }
    return null;
  }

  private validarQuantidadeTelefones(control: AbstractControl) {
    const telefones = control as FormArray;
    return telefones.length > 0 ? null : { minimoTelefones: true };
  }

  get podeCadastrar(): boolean {
    return this.formulario.valid && this.telefones.length > 0;
  }

  mostrarErro(campo: string, erro?: string): boolean {
    const control = this.formulario.get(campo);
    if (!control) {
      return false;
    }

    const exibivel = control.touched || control.dirty;
    if (!exibivel) {
      return false;
    }

    return erro ? control.hasError(erro) : control.invalid;
  }

  mostrarErroSenhas(): boolean {
    const confSenha = this.formulario.get('confSenha');
    return !!confSenha && (confSenha.touched || confSenha.dirty) && this.formulario.hasError('senhasDiferentes');
  }

  mostrarErroTelefones(): boolean {
    return this.telefones.hasError('minimoTelefones') && (this.telefones.touched || this.telefones.dirty);
  }

  enviar() {
    this.formulario.markAllAsTouched();
    this.telefones.markAsTouched();

    if (!this.podeCadastrar) {
      return;
    }

    this.dadosCadastrados = {
      nome: this.formulario.get('nome')?.value ?? '',
      email: this.formulario.get('email')?.value ?? '',
      telefones: this.telefones.controls.map((telefone) => telefone.value),
      idade: Number(this.formulario.get('idade')?.value),
      cidade: this.formulario.get('cidade')?.value ?? '',
      genero: this.formulario.get('genero')?.value ?? '',
    };

    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }
}
