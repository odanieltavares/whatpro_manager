'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface DeleteInstanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deleteFromApi: boolean) => void;
  instanceName: string;
  provider: string;
}

export function DeleteInstanceDialog({
  open,
  onOpenChange,
  onConfirm,
  instanceName,
  provider
}: DeleteInstanceDialogProps) {
  const [deleteFromApi, setDeleteFromApi] = useState(false);

  const handleConfirm = () => {
    onConfirm(deleteFromApi);
    setDeleteFromApi(false); // Reset for next time
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <AlertDialogTitle>Excluir Instância</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              Você está prestes a excluir a instância <strong>{instanceName}</strong>.
            </p>
            <p className="text-sm">
              Esta ação removerá a instância do WhatPro Manager e não pode ser desfeita.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-start space-x-2 py-4 px-1 border rounded-md bg-muted/50">
          <Checkbox
            id="deleteFromApi"
            checked={deleteFromApi}
            onCheckedChange={(checked) => setDeleteFromApi(checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1">
            <Label 
              htmlFor="deleteFromApi" 
              className="cursor-pointer font-medium"
            >
              Excluir também da API do provider ({provider})
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Se marcado, a instância será removida permanentemente do servidor {provider}.
              Caso contrário, será removida apenas do Manager.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeleteFromApi(false)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteFromApi ? 'Excluir de Tudo' : 'Excluir do Manager'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
