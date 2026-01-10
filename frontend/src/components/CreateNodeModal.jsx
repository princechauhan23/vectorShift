import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Plus, Trash2, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNodeDefinitionStore } from '@/stores/nodeDefinitionStore';
import { fetchNodeDefinitions } from '@/nodes/nodeRegistry';

const defaultFieldValues = {
  name: '',
  label: '',
  type: 'text',
  defaultValue: '',
};

const defaultHandleValues = {
  id: '',
  type: 'source',
  position: 'Right',
  top: '',
};

const CreateNodeModal = ({ open, onOpenChange, onSubmit }) => {
  const [submitError, setSubmitError] = useState(null);
  const { createNodeDefinition, isLoading } = useNodeDefinitionStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: '',
      title: '',
      label: '',
      description: '',
      accent: '#3b82f6',
      fields: [],
      handles: [],
    },
  });

  const {
    fields: fieldArrayFields,
    append: appendField,
    remove: removeField,
  } = useFieldArray({
    control,
    name: 'fields',
  });

  const {
    fields: handleArrayFields,
    append: appendHandle,
    remove: removeHandle,
  } = useFieldArray({
    control,
    name: 'handles',
  });

  const handleFormSubmit = async (data) => {
    setSubmitError(null);

    const result = await createNodeDefinition(data);

    if (result.success) {
      onSubmit?.(result.data);
      reset();
      await fetchNodeDefinitions();
      onOpenChange(false);
    } else {
      setSubmitError(result.error);
    }
  };

  const handleClose = () => {
    reset();
    setSubmitError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Node</DialogTitle>
          <DialogDescription>
            Define a new node type with custom fields and handles.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Controller
                name="type"
                control={control}
                rules={{ required: 'Type is required' }}
                render={({ field }) => (
                  <Input
                    id="type"
                    placeholder="e.g., customNode"
                    {...field}
                  />
                )}
              />
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <Input
                    id="title"
                    placeholder="e.g., Custom Node"
                    {...field}
                  />
                )}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">Label *</Label>
              <Controller
                name="label"
                control={control}
                rules={{ required: 'Label is required' }}
                render={({ field }) => (
                  <Input
                    id="label"
                    placeholder="e.g., Custom"
                    {...field}
                  />
                )}
              />
              {errors.label && (
                <p className="text-sm text-red-500">{errors.label.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent">Accent Color</Label>
              <Controller
                name="accent"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    <Input
                      id="accent"
                      type="color"
                      className="w-12 h-9 p-1 cursor-pointer"
                      {...field}
                    />
                    <Input
                      placeholder="#3b82f6"
                      value={field.value}
                      onChange={field.onChange}
                      className="flex-1"
                    />
                  </div>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  placeholder="Describe what this node does..."
                  rows={2}
                  {...field}
                />
              )}
            />
          </div>

          {/* Fields Array */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Fields</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendField(defaultFieldValues)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Field
              </Button>
            </div>

            {fieldArrayFields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                No fields added. Click "Add Field" to add input fields to your node.
              </p>
            )}

            {fieldArrayFields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border rounded-lg space-y-3 bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Field {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Controller
                      name={`fields.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <Input placeholder="fieldName" {...field} />
                      )}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Controller
                      name={`fields.${index}.label`}
                      control={control}
                      render={({ field }) => (
                        <Input placeholder="Field Label" {...field} />
                      )}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Controller
                      name={`fields.${index}.type`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="textarea">Textarea</SelectItem>
                            {/* <SelectItem value="select">Select</SelectItem> */}
                            <SelectItem value="number">Number</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Default Value</Label>
                    <Controller
                      name={`fields.${index}.defaultValue`}
                      control={control}
                      render={({ field }) => (
                        <Input placeholder="default" {...field} />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Handles Array */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Handles</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendHandle(defaultHandleValues)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Handle
              </Button>
            </div>

            {handleArrayFields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                No handles added. Click "Add Handle" to add connection points.
              </p>
            )}

            {handleArrayFields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border rounded-lg space-y-3 bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Handle {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHandle(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">ID</Label>
                    <Controller
                      name={`handles.${index}.id`}
                      control={control}
                      render={({ field }) => (
                        <Input placeholder="handleId" {...field} />
                      )}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Controller
                      name={`handles.${index}.type`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="source">Source (Output)</SelectItem>
                            <SelectItem value="target">Target (Input)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Position</Label>
                    <Controller
                      name={`handles.${index}.position`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Left">Left</SelectItem>
                            <SelectItem value="Right">Right</SelectItem>
                            {/* <SelectItem value="Top">Top</SelectItem> */}
                            {/* <SelectItem value="Bottom">Bottom</SelectItem> */}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Top (%)</Label>
                    <Controller
                      name={`handles.${index}.top`}
                      control={control}
                      render={({ field }) => (
                        <Input placeholder="e.g., 30%" {...field} />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {submitError && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {submitError}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Node'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNodeModal;
